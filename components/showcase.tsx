import Image from "next/image"

const CASE_STUDIES = [
  {
    title: "Vibrant Landscapes",
    description: "Enhanced colors and natural lighting for travel bloggers.",
    image: "/scenic-mountain-landscape-photography.jpg",
  },
  {
    title: "Clean Product Shots",
    description: "Background removal and soft shadows for e-commerce.",
    image: "/minimalist-product-photography-shoes.jpg",
  },
  {
    title: "Portrait Magic",
    description: "Skin smoothing and eye enhancement with one click.",
    image: "/stylish-portrait-photography.jpg",
  },
]

export function Showcase() {
  return (
    <section id="showcase" className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Case Studies</h2>
          <p className="text-muted-foreground">See how creators are using BananaEdit to level up their content.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {CASE_STUDIES.map((item, i) => (
            <div key={i} className="group cursor-pointer">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-6">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <span className="text-white font-semibold">View Case Study →</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
