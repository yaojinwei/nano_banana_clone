import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const FAQS = [
  {
    q: "Is BananaEdit really free to use?",
    a: "Yes! BananaEdit offers a generous free tier that includes all essential editing tools. We also have a 'Premium Bunch' plan for heavy users who need batch processing.",
  },
  {
    q: "What file formats do you support?",
    a: "We support all major web formats including PNG, JPG, WebP, SVG, and even raw banana-vision files (just kidding, but we're working on it).",
  },
  {
    q: "How does the AI background removal work?",
    a: "Our proprietary AI algorithm identifies subjects with surgical precision, peeling away backgrounds cleaner than a ripe Cavendish banana.",
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. We don't store your images unless you choose to save them to our cloud. Everything else is processed securely and deleted immediately after your session.",
  },
]

export function FAQ() {
  return (
    <section id="faq" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Got Questions?</h2>
          <p className="text-muted-foreground">Everything you need to know about the world's freshest editor.</p>
        </div>
        <Accordion type="single" collapsible className="w-full bg-card rounded-3xl p-4 border">
          {FAQS.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-none px-4">
              <AccordionTrigger className="text-left font-bold py-6 hover:text-primary hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-6">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
