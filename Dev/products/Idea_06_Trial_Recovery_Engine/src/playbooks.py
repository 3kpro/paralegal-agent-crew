from typing import List, Dict, Optional
from .models.domain import AbandonmentCategory, Classification, Playbook, User, Event
from .personalizer import AIPersonalizer

class PlaybookGenerator:
    def __init__(self, use_ai: bool = False):
        self.templates = self._initialize_templates()
        self.use_ai = use_ai
        self.personalizer = AIPersonalizer() if use_ai else None

    def generate_for_classification(self, classification: Classification, user: Optional[User] = None, events: Optional[List[Event]] = None) -> Playbook:
        """
        Generates a recovery playbook based on the user's abandonment classification.
        """
        category = classification.category
        template_wrapper = self.templates.get(category, self.templates[AbandonmentCategory.GHOSTED])
        
        email_templates = template_wrapper["emails"]
        
        # Apply AI personalization if enabled and data provided
        if self.use_ai and user and events:
            personalized_emails = []
            for t in email_templates:
                personalized_emails.append(self.personalizer.personalize_template(user, classification, events, t))
            email_templates = personalized_emails

        return Playbook(
            id=f"pb_{classification.trial_id}",
            name=f"Recovery Playbook: {category.value.title()}",
            target_category=category,
            email_templates=email_templates,
            offer_type=template_wrapper["offer_type"],
            timing_days=template_wrapper["timing_days"]
        )

    def _initialize_templates(self) -> Dict[AbandonmentCategory, Dict]:
        return {
            AbandonmentCategory.CONFUSED: {
                "offer_type": "Consultation",
                "timing_days": [1, 3, 7],
                "emails": [
                    {
                        "subject": "Need a hand with {{product_name}}?",
                        "body": "Hi {{name}}, I noticed you started setting up but didn't quite finish. Most users find it easier with a 15-min walkthrough. Want to hop on a quick call?"
                    }
                ]
            },
            AbandonmentCategory.PRICE_SENSITIVE: {
                "offer_type": "Discount",
                "timing_days": [1, 5],
                "emails": [
                    {
                        "subject": "A special offer for your {{product_name}} trial",
                        "body": "Hi {{name}}, we'd love to have you on board. Use code RECOVER20 for 20% off your first year."
                    }
                ]
            },
            AbandonmentCategory.NEEDS_MORE_TIME: {
                "offer_type": "Extension",
                "timing_days": [0, 4],
                "emails": [
                    {
                        "subject": "Your trial expired - need more time?",
                        "body": "Hi {{name}}, life gets busy! I've added 7 extra days to your trial so you can finish your evaluation."
                    }
                ]
            },
            AbandonmentCategory.WRONG_FIT: {
                "offer_type": "Feedback Request",
                "timing_days": [2],
                "emails": [
                    {
                        "subject": "Did we miss the mark?",
                        "body": "Hi {{name}}, I saw you used {{product_name}} but decided not to continue. Was there a specific feature missing, or was it just not the right fit? Your feedback helps us improve."
                    }
                ]
            },
            AbandonmentCategory.COMPETITOR_EVAL: {
                "offer_type": "Differentiator Guide",
                "timing_days": [1, 3],
                "emails": [
                    {
                        "subject": "How we compare to the rest",
                        "body": "Hi {{name}}, I know you're looking at a few options. Here is a quick breakdown of why {{product_name}} is the choice for teams that value [Key Differentiator]."
                    }
                ]
            },
            AbandonmentCategory.GHOSTED: {
                "offer_type": "Re-engagement",
                "timing_days": [3, 10],
                "emails": [
                    {
                        "subject": "Still interested in {{problem_solved}}?",
                        "body": "Hi {{name}}, just checking back in to see if you're still looking to solve {{problem_solved}}."
                    }
                ]
            }
        }
