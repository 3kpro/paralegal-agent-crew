from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import re
from .base import DocumentContent, ParsedChunk
from .pdf_parser import PDFParser

@dataclass
class SOC2Control:
    id: str
    description: str
    has_exception: bool
    exception_details: str

class SOC2Parser(PDFParser):
    def parse_soc2(self, file_path: str) -> Dict[str, Any]:
        """
        Specialized parsing for SOC 2 reports to extract controls and exceptions.
        Returns a dict with structured findings alongside the standard content.
        """
        # First get standard parsing (text/chunks)
        base_content = self.parse(file_path)
        
        # Analyze for controls and exceptions
        controls = self._extract_controls(base_content.text)
        exceptions = [c for c in controls if c.has_exception]
        
        return {
            "document_content": base_content,
            "period_start": self._extract_period(base_content.text, "start"),
            "period_end": self._extract_period(base_content.text, "end"),
            "cpa_firm": self._extract_cpa_firm(base_content.text),
            "total_controls": len(controls),
            "exception_count": len(exceptions),
            "findings": exceptions
        }

    def _extract_cpa_firm(self, text: str) -> str:
        # Naive heuristic: Look for lines ending in LLP, LLC, or P.C. early in the doc
        lines = text.split('\n')[:50]
        for line in lines:
            if re.search(r'(LLP|LLC|P\.C\.|Inc\.)', line):
                return line.strip()
        return "Unknown Firm"

    def _extract_period(self, text: str, type: str) -> str:
        # Look for dates
        # "Period: January 1, 202X to December 31, 202X"
        match = re.search(r'Period:?\s*([A-Za-z]+ \d{1,2},? \d{4}).*?([A-Za-z]+ \d{1,2},? \d{4})', text, re.IGNORECASE)
        if match:
            return match.group(1) if type == "start" else match.group(2)
        return "Unknown"

    def _extract_controls(self, text: str) -> List[SOC2Control]:
        """
        Attempt to identify control identifiers (CC1.1, CC1.2, etc.) and check for exception language.
        This is a heuristic approach assuming standard TSC identifiers.
        """
        controls = []
        # Regex for common trust service criteria IDs (e.g. CC1.3, A1.2)
        # Often starts a line
        control_pattern = re.compile(r'^(CC|A|PI|C)\d+\.\d+', re.MULTILINE)
        
        lines = text.split('\n')
        current_control = None
        
        for i, line in enumerate(lines):
            match = control_pattern.match(line)
            if match:
                # Save previous
                if current_control:
                    controls.append(current_control)
                    
                # Start new
                current_control = SOC2Control(
                    id=match.group(0),
                    description=line[len(match.group(0)):].strip(),
                    has_exception=False,
                    exception_details=""
                )
            elif current_control:
                # Append description
                if len(current_control.description) < 500: # Limit description length
                    current_control.description += " " + line.strip()
                
                # Check for bad words in the vicinity of this control
                # SOC 2 usually lists "No exceptions noted" or "Exception noted: ..." in a column
                # Since we are flattening text, we look for nearby negative phrases
                lower_line = line.lower()
                if "exception noted" in lower_line or "deviation noted" in lower_line:
                    current_control.has_exception = True
                    current_control.exception_details = line.strip()
                    
        # Add last
        if current_control:
            controls.append(current_control)
            
        return controls
