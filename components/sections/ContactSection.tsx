import ContactForm from "../ContactForm";

export const ContactSection: React.FC = () => {
  return (
    <section
      id="contact"
      className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-[#2b2b2b]"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Get Your Custom Campaign Proposal
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Tell us about your project and we'll create a personalized Content
            Cascade strategy for your business.
          </p>
        </div>

        <ContactForm />
      </div>
    </section>
  );
};
