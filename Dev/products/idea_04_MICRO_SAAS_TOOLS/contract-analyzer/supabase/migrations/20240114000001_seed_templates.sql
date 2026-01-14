-- Seed Contract Templates
INSERT INTO public.templates (name, category, description, file_url, is_premium)
VALUES 
('Mutual NDA', 'NDA', 'Standard non-disclosure agreement for mutual information exchange.', '/templates/mutual-nda.txt', false),
('One-Way NDA', 'NDA', 'Protect your secrets when sharing with a third party.', '/templates/one-way-nda.txt', false),
('Freelance Agreement', 'Service', 'Simple agreement for freelance work and payment terms.', '/templates/freelance-agreement.txt', false),
('Statement of Work', 'Service', 'Define project scope, schedule, and deliverables clearly.', '/templates/sow.txt', false),
('Consulting Agreement', 'Professional', 'For expert consulting services and hourly engagements.', '/templates/consulting-agreement.txt', true),
('Contractor Agreement', 'Professional', 'Standard independent contractor agreement with termination terms.', '/templates/contractor-agreement.txt', true),
('Master Services Agreement', 'Corporate', 'The foundation for long-term service relationships.', '/templates/msa.txt', true),
('Work-for-Hire', 'IP', 'Ensure you own all creative rights to the work you pay for.', '/templates/work-for-hire.txt', true),
('Non-Compete', 'Employment', 'Protect your business from unfair competition.', '/templates/non-compete.txt', true),
('Confidentiality Agreement', 'IP', 'Dedicated focus on protecting proprietary data.', '/templates/confidentiality.txt', false);
