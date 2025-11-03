// app/evaluation/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  Check, 
  ChevronRight, 
  Clock, 
  Users, 
  Shield, 
  Star,
  Menu,
  X,
  Plus,
  Minus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

// Types for the evaluation tool
export type EvaluationStep = 'landing' | 'basics' | 'challenges' | 'goals' | 'results';

export interface BusinessFormData {
  industry: string;
  companySize: string;
  location: string;
  businessModel: string;
  techAdoption: string;
  painPoints: string[];
  goals: string[];
  budget: string;
  timeline: string;
  specificChallenges: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

export interface AISolution {
  title: string;
  description: string;
  benefits: string[];
  roi: string;
}

// Add this to your existing types file or create a new one
export interface EvaluationContextType {
  currentStep: EvaluationStep;
  formData: BusinessFormData;
  setCurrentStep: (step: EvaluationStep) => void;
  updateFormData: (field: keyof BusinessFormData, value: any) => void;
  resetEvaluation: () => void;
}

// Industry-specific questions
const industryQuestions: Record<string, any[]> = {
  travel: [
    {
      id: "travelChallenges",
      type: "checkbox",
      question: "What are your biggest challenges in the travel industry?",
      options: [
        "Booking management and automation",
        "Customer communication and support",
        "Inventory and availability tracking",
        "Price optimization and revenue management",
        "Marketing and customer acquisition",
        "Payment processing and reconciliation"
      ],
      required: true
    }
  ],
  retail: [
    {
      id: "retailChallenges",
      type: "checkbox",
      question: "What retail operations need improvement?",
      options: [
        "Inventory management and forecasting",
        "Customer experience personalization",
        "Omnichannel integration",
        "Supply chain optimization",
        "Staff scheduling and management",
        "Loss prevention and security"
      ],
      required: true
    }
  ],
  healthcare: [
    {
      id: "healthcareChallenges",
      type: "checkbox",
      question: "Which healthcare processes need optimization?",
      options: [
        "Patient scheduling and reminders",
        "Medical record management",
        "Billing and insurance processing",
        "Patient communication and follow-up",
        "Compliance and documentation",
        "Resource allocation and utilization"
      ],
      required: true
    }
  ],
  professional: [
    {
      id: "professionalChallenges",
      type: "checkbox",
      question: "What professional service challenges do you face?",
      options: [
        "Client onboarding and management",
        "Project tracking and billing",
        "Document management and automation",
        "Team collaboration and communication",
        "Lead generation and nurturing",
        "Reporting and analytics"
      ],
      required: true
    }
  ]
};

export default function AIBusinessEvaluationTool() {
  const [currentStep, setCurrentStep] = useState<EvaluationStep>('landing');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [formData, setFormData] = useState<BusinessFormData>({
    industry: "",
    companySize: "",
    location: "",
    businessModel: "",
    techAdoption: "",
    painPoints: [],
    goals: [],
    budget: "",
    timeline: "",
    specificChallenges: "",
    contactName: "",
    contactEmail: "",
    contactPhone: ""
  });
  const [expandedSolutions, setExpandedSolutions] = useState<number[]>([]);

  // Auto-save to localStorage
  useEffect(() => {
    const savedData = localStorage.getItem("evaluationFormData");
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("evaluationFormData", JSON.stringify(formData));
  }, [formData]);

  const updateFormData = (field: keyof BusinessFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const togglePainPoint = (point: string) => {
    setFormData(prev => ({
      ...prev,
      painPoints: prev.painPoints.includes(point)
        ? prev.painPoints.filter(p => p !== point)
        : [...prev.painPoints, point]
    }));
  };

  const toggleGoal = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const toggleSolution = (index: number) => {
    setExpandedSolutions(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const calculateProgress = () => {
    const steps: Record<EvaluationStep, number> = {
      'landing': 0,
      'basics': 1,
      'challenges': 2,
      'goals': 3,
      'results': 4
    };
    const totalSteps = 4;
    return (steps[currentStep] / totalSteps) * 100;
  };

  const generateSolutions = (): AISolution[] => {
    const solutions: AISolution[] = [];
    
    if (formData.painPoints.includes("Manual repetitive tasks")) {
      solutions.push({
        title: "Intelligent Process Automation",
        description: "Deploy AI-powered automation to eliminate repetitive tasks and free up your team for strategic work.",
        benefits: ["80% reduction in manual data entry", "24/7 operation capability", "Zero human error rate"],
        roi: "3-6 month payback period"
      });
    }
    
    if (formData.painPoints.includes("Customer service bottlenecks")) {
      solutions.push({
        title: "AI Customer Service Assistant",
        description: "Implement conversational AI to handle customer inquiries instantly, 24/7.",
        benefits: ["70% reduction in response time", "Handle 5x more inquiries", "Improved customer satisfaction"],
        roi: "2-4 month implementation"
      });
    }
    
    if (formData.painPoints.includes("Data analysis and reporting")) {
      solutions.push({
        title: "Predictive Analytics Dashboard",
        description: "Transform your data into actionable insights with AI-powered analytics.",
        benefits: ["Real-time business intelligence", "Predictive trend analysis", "Automated report generation"],
        roi: "Immediate insights from day one"
      });
    }
    
    // Add more industry-specific solutions based on selected industry
    if (formData.industry === 'travel' && formData.painPoints.some(p => p.includes("Booking management"))) {
      solutions.push({
        title: "AI Travel Booking Assistant",
        description: "Automate booking processes with intelligent recommendation engine.",
        benefits: ["Personalized travel recommendations", "Automated booking confirmations", "Dynamic pricing optimization"],
        roi: "4-8 week implementation"
      });
    }
    
    return solutions;
  };

  const handleSubmit = async () => {
    // Prepare data for submission
    const evaluationData = {
      ...formData,
      solutions: generateSolutions(),
      submittedAt: new Date().toISOString(),
      evaluationId: `EVAL-${Date.now()}`
    };

    // Here you can integrate with your existing backend or API
    console.log("Submitting evaluation:", evaluationData);
    
    // You could also integrate with your Google AI here to generate a more detailed report
    // For example, generate a personalized email or detailed PDF report
    
    // Show confirmation
    alert("Thank you! Your evaluation has been submitted. Our team will contact you within 24 hours with your customized AI solution roadmap.");
    
    // Optional: Reset form or redirect
    // resetEvaluation();
  };

  const resetEvaluation = () => {
    setFormData({
      industry: "",
      companySize: "",
      location: "",
      businessModel: "",
      techAdoption: "",
      painPoints: [],
      goals: [],
      budget: "",
      timeline: "",
      specificChallenges: "",
      contactName: "",
      contactEmail: "",
      contactPhone: ""
    });
    setCurrentStep('landing');
    localStorage.removeItem("evaluationFormData");
  };

  // Component renders for each step
  const renderLandingPage = () => (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">AI Solutions Pro</h1>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#benefits" className="text-gray-700 hover:text-blue-600 transition">Benefits</a>
              <a href="#process" className="text-gray-700 hover:text-blue-600 transition">Process</a>
              <a href="#testimonials" className="text-gray-700 hover:text-blue-600 transition">Success Stories</a>
              <Button onClick={() => setCurrentStep('basics')}>Start Evaluation</Button>
            </div>
            <div className="md:hidden">
              <button onClick={() => setShowMobileMenu(!showMobileMenu)}>
                {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
        {/* Mobile menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t"
            >
              <div className="px-4 py-4 space-y-3">
                <a href="#benefits" className="block text-gray-700 hover:text-blue-600">Benefits</a>
                <a href="#process" className="block text-gray-700 hover:text-blue-600">Process</a>
                <a href="#testimonials" className="block text-gray-700 hover:text-blue-600">Success Stories</a>
                <Button onClick={() => setCurrentStep('basics')} className="w-full">Start Evaluation</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
          >
            Transform Your Business with{" "}
            <span className="text-blue-600">AI-Powered Workflows</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 mb-8"
          >
            Discover how AI can increase your productivity by 300% and reduce operational costs by 50%.
            Get your personalized AI transformation roadmap in just 5 minutes.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              size="lg"
              onClick={() => setCurrentStep('basics')}
              className="text-lg px-8 py-6"
            >
              Unlock Your Business Potential
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">500+</div>
              <div className="text-gray-600">Businesses Transformed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">92%</div>
              <div className="text-gray-600">Client Satisfaction</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">3.2x</div>
              <div className="text-gray-600">Average ROI</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">24/7</div>
              <div className="text-gray-600">AI Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose AI Solutions Pro?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition">
              <CardHeader>
                <Clock className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Save Time</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Automate repetitive tasks and focus on what matters most - growing your business.
                </p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition">
              <CardHeader>
                <Users className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Delight Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Provide instant, personalized service that exceeds customer expectations.
                </p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition">
              <CardHeader>
                <Shield className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Reduce Errors</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Eliminate human error with AI-powered accuracy and consistency.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Business?</h2>
          <p className="text-xl mb-8 opacity-90">
            Get your free personalized AI implementation roadmap in just 5 minutes.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => setCurrentStep('basics')}
            className="text-lg px-8 py-6"
          >
            Start Your AI Transformation
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );

  const renderBasics = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Let's start with your business basics</h2>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="industry">Industry</Label>
          <Select value={formData.industry} onValueChange={(value) => updateFormData("industry", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="travel">Travel & Tourism</SelectItem>
              <SelectItem value="retail">Retail & E-commerce</SelectItem>
              <SelectItem value="healthcare">Healthcare & Medical</SelectItem>
              <SelectItem value="professional">Professional Services</SelectItem>
              <SelectItem value="manufacturing">Manufacturing</SelectItem>
              <SelectItem value="finance">Finance & Banking</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="companySize">Company Size</Label>
          <Select value={formData.companySize} onValueChange={(value) => updateFormData("companySize", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select company size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-10">1-10 employees</SelectItem>
              <SelectItem value="11-50">11-50 employees</SelectItem>
              <SelectItem value="51-200">51-200 employees</SelectItem>
              <SelectItem value="201-500">201-500 employees</SelectItem>
              <SelectItem value="500+">500+ employees</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => updateFormData("location", e.target.value)}
            placeholder="City, State/Country"
          />
        </div>

        <div>
          <Label>Current Technology Adoption Level</Label>
          <RadioGroup value={formData.techAdoption} onValueChange={(value) => updateFormData("techAdoption", value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="basic" id="basic" />
              <Label htmlFor="basic">Basic (Mostly manual processes)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="intermediate" id="intermediate" />
              <Label htmlFor="intermediate">Intermediate (Some digital tools)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="advanced" id="advanced" />
              <Label htmlFor="advanced">Advanced (Integrated systems)</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={() => setCurrentStep('landing')}>
          Back
        </Button>
        <Button 
          onClick={() => setCurrentStep('challenges')}
          disabled={!formData.industry || !formData.companySize || !formData.techAdoption}
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderChallenges = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">What challenges are you facing?</h2>
      
      <div className="space-y-4">
        <Label>Select all that apply:</Label>
        <div className="space-y-3">
          {[
            "Manual repetitive tasks",
            "Customer service bottlenecks",
            "Data analysis and reporting",
            "Inventory management",
            "Lead generation and sales",
            "Document processing",
            "Scheduling and resource allocation",
            "Quality control issues"
          ].map((painPoint) => (
            <Card
              key={painPoint}
              className={`cursor-pointer transition ${
                formData.painPoints.includes(painPoint) ? "border-blue-500 bg-blue-50" : ""
              }`}
              onClick={() => togglePainPoint(painPoint)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <span>{painPoint}</span>
                {formData.painPoints.includes(painPoint) && (
                  <Check className="h-5 w-5 text-blue-600" />
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {formData.industry && industryQuestions[formData.industry] && (
          <div className="mt-6">
            <Label className="text-lg font-semibold mb-3 block">
              Industry-Specific Challenges
            </Label>
            {industryQuestions[formData.industry].map((question: any) => (
              <div key={question.id} className="space-y-3">
                <Label>{question.question}</Label>
                {question.options?.map((option: string) => (
                  <Card
                    key={option}
                    className={`cursor-pointer transition ${
                      formData.painPoints.includes(option) ? "border-blue-500 bg-blue-50" : ""
                    }`}
                    onClick={() => togglePainPoint(option)}
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <span>{option}</span>
                      {formData.painPoints.includes(option) && (
                        <Check className="h-5 w-5 text-blue-600" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={() => setCurrentStep('basics')}>
          Back
        </Button>
        <Button 
          onClick={() => setCurrentStep('goals')}
          disabled={formData.painPoints.length === 0}
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderGoals = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">What are your goals?</h2>
      
      <div className="space-y-4">
        <Label>What would you like to achieve with AI? (Select all that apply)</Label>
        <div className="space-y-3">
          {[
            "Reduce operational costs by 30%+",
            "Improve customer satisfaction scores",
            "Scale business without adding staff",
            "Eliminate manual data entry",
            "Provide 24/7 customer service",
            "Make data-driven decisions",
            "Automate repetitive workflows",
            "Increase revenue by 20%+"
          ].map((goal) => (
            <Card
              key={goal}
              className={`cursor-pointer transition ${
                formData.goals.includes(goal) ? "border-blue-500 bg-blue-50" : ""
              }`}
              onClick={() => toggleGoal(goal)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <span>{goal}</span>
                {formData.goals.includes(goal) && (
                  <Check className="h-5 w-5 text-blue-600" />
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4 pt-4">
          <div>
            <Label htmlFor="budget">Budget Range</Label>
            <Select value={formData.budget} onValueChange={(value) => updateFormData("budget", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select budget range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="<10k">Less than $10,000</SelectItem>
                <SelectItem value="10k-25k">$10,000 - $25,000</SelectItem>
                <SelectItem value="25k-50k">$25,000 - $50,000</SelectItem>
                <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                <SelectItem value="100k+">$100,000+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="timeline">Implementation Timeline</Label>
            <Select value={formData.timeline} onValueChange={(value) => updateFormData("timeline", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select timeline" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asap">As soon as possible</SelectItem>
                <SelectItem value="1-3months">1-3 months</SelectItem>
                <SelectItem value="3-6months">3-6 months</SelectItem>
                <SelectItem value="6-12months">6-12 months</SelectItem>
                <SelectItem value="planning">Just planning</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="specificChallenges">Specific Challenges or Requirements (Optional)</Label>
            <Textarea
              id="specificChallenges"
              value={formData.specificChallenges}
              onChange={(e) => updateFormData("specificChallenges", e.target.value)}
              placeholder="Tell us more about your specific needs..."
              rows={4}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={() => setCurrentStep('challenges')}>
          Back
        </Button>
        <Button 
          onClick={() => setCurrentStep('results')}
          disabled={formData.goals.length === 0 || !formData.budget || !formData.timeline}
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderResults = () => {
    const solutions = generateSolutions();
    
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Your Personalized AI Solution Roadmap</h2>
          <p className="text-gray-600">Based on your responses, here's how AI can transform your business:</p>
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 text-yellow-500 mr-2" />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              Your {formData.industry} business with {formData.companySize} employees is perfectly positioned 
              for AI transformation. Based on your {formData.techAdoption} technology adoption level, 
              we've identified {solutions.length} key AI solutions that can deliver results within your {formData.timeline} timeline.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Recommended AI Solutions</h3>
          {solutions.map((solution, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader 
                className="cursor-pointer"
                onClick={() => toggleSolution(index)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{solution.title}</CardTitle>
                  {expandedSolutions.includes(index) ? (
                    <Minus className="h-5 w-5 text-gray-500" />
                  ) : (
                    <Plus className="h-5 w-5 text-gray-500" />
                  )}
                </div>
                <CardDescription>{solution.description}</CardDescription>
              </CardHeader>
              <AnimatePresence>
                {expandedSolutions.includes(index) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold mb-2">Key Benefits:</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {solution.benefits.map((benefit, i) => (
                              <li key={i} className="text-gray-600">{benefit}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-green-800 font-semibold">{solution.roi}</p>
                        </div>
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          ))}
        </div>

        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              To receive your detailed implementation plan and discuss how we can help transform your business:
            </p>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="contactName">Your Name</Label>
                <Input
                  id="contactName"
                  value={formData.contactName}
                  onChange={(e) => updateFormData("contactName", e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="contactEmail">Email Address</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => updateFormData("contactEmail", e.target.value)}
                  placeholder="john@company.com"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="contactPhone">Phone Number (Optional)</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => updateFormData("contactPhone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={() => setCurrentStep('goals')}>
            Back
          </Button>
          <Button 
            size="lg"
            onClick={handleSubmit}
            disabled={!formData.contactName || !formData.contactEmail}
            className="bg-green-600 hover:bg-green-700"
          >
            Submit for Expert Review
            <Check className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  };

  const renderQuestionnaire = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Progress */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-blue-600">AI Solutions Pro</h1>
            <span className="text-sm text-gray-600">
              {currentStep !== 'landing' && `Step ${calculateProgress() / 25} of 4`}
            </span>
          </div>
          {currentStep !== 'landing' && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-blue-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${calculateProgress()}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="shadow-lg">
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === 'basics' && renderBasics()}
                {currentStep === 'challenges' && renderChallenges()}
                {currentStep === 'goals' && renderGoals()}
                {currentStep === 'results' && renderResults()}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return currentStep === 'landing' ? renderLandingPage() : renderQuestionnaire();
}

// END OF FILE