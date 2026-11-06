"""Sample data. Every artisan, review and product here is FICTIONAL placeholder content
until real artisan information is supplied.

Run `uv run python -m app.seed --reset` to wipe and reseed the database.
"""

import sys
from datetime import timedelta

from sqlmodel import Session, SQLModel, select

from .db import engine
from .models import Artisan, Product, Review, utcnow

CATEGORIES = [
    {"slug": "crochet-toys", "name": "Crochet Toys", "image": "/images/products/bunny-1.jpg"},
    {"slug": "crochet-bags", "name": "Crochet Bags", "image": "/images/products/bag-1.jpg"},
    {"slug": "home-decor", "name": "Home Decor", "image": "/images/products/plant-1.jpg"},
    {"slug": "accessories", "name": "Accessories", "image": "/images/products/flower-1.jpg"},
    {"slug": "crochet-flowers", "name": "Crochet Flowers", "image": "/images/products/sunflower-1.jpg"},
    {"slug": "handloom-crafts", "name": "Other Handloom Crafts", "image": "/images/products/runner-1.jpg"},
]

ARTISANS = [
    dict(
        slug="savitri-devi", name="Savitri Devi", location="Varanasi, Uttar Pradesh", state="Uttar Pradesh",
        specialisation="Amigurumi toys, bags & crochet flowers",
        tagline="Keeping the traditional art of handmade crochet alive.",
        story=("Savitri is a skilled crochet artisan from a rural community near Varanasi. She learned to crochet "
               "from her mother at twelve and now leads a small group of women who stitch together in the "
               "afternoons. Through her craft, she supports her family and keeps the traditional art of "
               "handmade crochet alive."),
        journey=["Learned to crochet from her mother at age 12",
                 "Started selling small pieces at local fairs in 2016",
                 "Began leading a group of 6 women artisans in 2021",
                 "Joined Chenethakart to reach customers across India"],
        avatar="/images/artisans/savitri.jpg", years_experience=18,
    ),
    dict(
        slug="padma-reddy", name="Padma Reddy", location="Pochampally, Telangana", state="Telangana",
        specialisation="Handloom cotton weaving",
        tagline="Every thread carries a story from our loom.",
        story=("Padma comes from a family of weavers in Pochampally, where cotton has been woven on pit looms for "
               "generations. She designs table linen and small home textiles that bring traditional stripes and "
               "checks into modern homes."),
        journey=["Started at her family loom at age 14",
                 "Took over her family's weaving unit in 2014",
                 "Trained three young weavers from her village",
                 "Now supplies Chenethakart with table linen"],
        avatar=None, years_experience=22,
    ),
    dict(
        slug="anjali-verma", name="Anjali Verma", location="Jaipur, Rajasthan", state="Rajasthan",
        specialisation="Crochet flowers & accessories",
        tagline="Tiny blooms that never wilt.",
        story=("Anjali began crocheting flowers as a hobby while studying and turned it into a full-time craft. "
               "Her hair clips, brooches and appliqués are made in small batches with soft cotton yarn."),
        journey=["Crocheted her first flower in 2018",
                 "Opened a small home studio in 2020",
                 "Now creates accessories in small batches"],
        avatar=None, years_experience=8,
    ),
    dict(
        slug="rukmini-nair", name="Rukmini Nair", location="Kochi, Kerala", state="Kerala",
        specialisation="Crochet home decor",
        tagline="Bringing a little green into every home.",
        story=("Rukmini creates crochet plants, baskets and table pieces inspired by the gardens of coastal Kerala. "
               "She works with natural cotton and plant-dyed yarn wherever she can."),
        journey=["Started with crochet baskets in 2015",
                 "Introduced crochet plants in 2019",
                 "Now teaches weekend workshops to young crafters"],
        avatar=None, years_experience=11,
    ),
    dict(
        slug="geeta-kumari", name="Geeta Kumari", location="Patna, Bihar", state="Bihar",
        specialisation="Amigurumi animals",
        tagline="Soft toys made slowly, with love.",
        story=("Geeta specialises in amigurumi animals stitched tightly with child-safe yarn and safety eyes. "
               "Each toy takes her about two days from first stitch to final finishing."),
        journey=["Made toys for her own children first",
                 "Started selling online in 2020",
                 "Now trains other mothers in her neighbourhood"],
        avatar=None, years_experience=9,
    ),
]

QC_CHECKS = ["Stitching strength", "Finishing & loose threads", "Material quality", "Dimensions match listing"]


def P(slug, name, category, price, artisan, rating, count, pop, days_old, stock, img, short, desc,
      materials, specs, care, featured=False, bestseller=False, compare=None):
    return dict(slug=slug, name=name, category=category, price=price, artisan=artisan, rating=rating,
                review_count=count, popularity=pop, days_old=days_old, stock=stock, img=img,
                short_description=short, description=desc, materials=materials, specs=specs, care=care,
                featured=featured, bestseller=bestseller, compare_at_price=compare)


PRODUCTS = [
    P("crochet-turtle-toy", "Crochet Turtle Toy", "crochet-toys", 499, "savitri-devi", 4.8, 32, 98, 40, 14, "turtle",
      "A cute, handmade crochet turtle crafted with love by Indian artisans.",
      "A cute, handmade crochet turtle crafted with love by Indian artisans. Made from soft, high-quality yarn and "
      "perfect for kids or as a thoughtful gift. Its textured green shell and cream face make it a calming desk "
      "companion for grown-ups too.",
      ["100% milk cotton yarn", "Hypoallergenic polyester fibre fill", "Safety eyes"],
      {"Size": "18 cm × 12 cm", "Weight": "120 g", "Colour": "Cream & green", "Suitable for": "All ages (3+)"},
      "Spot clean with a damp cloth. Do not machine wash. Air dry away from direct sun.", True, True),
    P("crochet-sunflower-bouquet", "Crochet Sunflower Bouquet", "crochet-flowers", 599, "savitri-devi", 4.9, 41, 95,
      30, 22, "sunflower",
      "Three sunflowers that bloom all year, in a woven pot.",
      "Three hand-crocheted sunflowers on wired stems, arranged in a crochet-wrapped pot. They never wilt, need no "
      "water and bring warm colour to a desk, shelf or windowsill.",
      ["Cotton yarn", "Floral wire stems", "Crochet-wrapped pot"],
      {"Height": "28 cm", "Pot diameter": "8 cm", "Stems": "3 sunflowers", "Colour": "Yellow, brown & green"},
      "Dust gently with a soft brush. Keep dry.", True, True),
    P("handmade-crochet-bag", "Handmade Crochet Bag", "crochet-bags", 899, "savitri-devi", 4.7, 27, 90, 55, 8, "bag",
      "A structured pink handbag with a hand-stitched flower detail.",
      "A sturdy, structured crochet handbag in rosy pink with a hand-stitched flower. Lined for strength, with "
      "room for a phone, wallet and keys. Dressy enough for brunch, easy enough for every day.",
      ["Cotton tape yarn", "Cotton lining", "Magnetic snap closure"],
      {"Size": "24 × 18 × 9 cm", "Handle drop": "12 cm", "Weight": "260 g", "Colour": "Rose pink"},
      "Spot clean only. Reshape while damp and dry flat.", True, True, 1099),
    P("crochet-octopus-keychain", "Crochet Octopus Keychain", "accessories", 299, "savitri-devi", 4.8, 58, 99, 20,
      40, "octopus",
      "A smiling blue octopus for your keys, bag or backpack.",
      "A tiny, tightly stitched octopus with a happy face and curly tentacles. Comes with a sturdy metal ring that "
      "clips onto keys, bags or school backpacks.",
      ["Mercerised cotton yarn", "Metal key ring", "Polyfill"],
      {"Height": "9 cm (excluding ring)", "Weight": "30 g", "Colour": "Ocean blue"},
      "Wipe with a damp cloth. Do not soak.", False, True),
    P("crochet-flower-accessories", "Crochet Flower Accessories", "accessories", 249, "anjali-verma", 4.6, 19, 70, 6,
      35, "flower",
      "Pink crochet blossoms to clip, pin or sew onto anything.",
      "Soft pink crochet flowers with golden centres. Use them as hair accessories, brooches or appliqués on bags "
      "and jackets. Sold as a set of two with clip and pin backs.",
      ["Cotton yarn", "Metal clip & brooch pin"],
      {"Set": "2 flowers", "Diameter": "6 cm each", "Colour": "Pink & gold"},
      "Hand wash gently if needed. Dry flat.", False, False),
    P("crochet-home-decor-succulent", "Crochet Home Decor Succulent", "home-decor", 699, "rukmini-nair", 4.7, 14, 78,
      12, 12, "plant",
      "A lifelike crochet succulent in a terracotta-coloured pot.",
      "A crochet succulent with sculpted leaves, planted in a terracotta-coloured pot. A cheerful, no-maintenance "
      "accent for shelves, workdesks and coffee tables.",
      ["Cotton yarn", "Stiffened leaf stems", "Terracotta-coloured crochet pot"],
      {"Height": "20 cm", "Pot diameter": "9 cm", "Colour": "Green & terracotta"},
      "Dust with a soft brush. Keep away from moisture.", True, False),
    P("amigurumi-bunny-with-carrot", "Amigurumi Bunny with Carrot", "crochet-toys", 549, "geeta-kumari", 4.9, 36, 88,
      4, 3, "bunny",
      "A sweet cream bunny holding a tiny orange carrot.",
      "A snuggly amigurumi bunny with pink-lined ears, safety eyes and a little carrot to hold. Stitched tightly "
      "so it keeps its shape through years of cuddles.",
      ["Milk cotton yarn", "Polyester fibre fill", "Safety eyes"],
      {"Height": "22 cm", "Weight": "140 g", "Colour": "Cream, pink & orange", "Suitable for": "All ages (3+)"},
      "Spot clean only. Air dry.", True, False),
    P("handloom-cotton-table-runner", "Handloom Cotton Table Runner", "handloom-crafts", 799, "padma-reddy", 4.5, 11,
      60, 8, 9, "runner",
      "A striped handwoven cotton runner in earthy tones.",
      "Hand-woven on a pit loom in Pochampally, this cotton table runner pairs soft stripes of sage and terracotta "
      "with a natural base. It adds a quiet, traditional touch to dining and console tables.",
      ["100% handspun cotton", "Natural dyes (sample listing)"],
      {"Size": "35 × 140 cm", "Weight": "220 g", "Weave": "Plain weave with stripes"},
      "Machine wash cold on a gentle cycle. Iron on medium heat.", False, False),
    P("handloom-woven-coaster-set", "Handloom Woven Coaster Set", "handloom-crafts", 399, "padma-reddy", 4.6, 16, 66,
      25, 0, "coaster",
      "Four bold-striped woven coasters in forest green and terracotta.",
      "A set of four hand-woven cotton coasters in deep green and terracotta stripes. Absorbent, washable and "
      "sturdy enough for daily use.",
      ["100% cotton", "Natural dyes (sample listing)"],
      {"Set": "4 coasters", "Size": "10 × 10 cm each", "Weave": "Striped plain weave"},
      "Machine washable. Dry flat.", False, False),
]

REVIEW_POOL = [
    ("Ananya S., Bengaluru", 5, "Even better in person", "The stitching is neat and the finish feels premium. Arrived in lovely packaging."),
    ("Rohan M., Mumbai", 5, "Perfect gift", "Bought this as a gift and it got a big smile. Quality is clearly checked."),
    ("Ishita K., Hyderabad", 4, "Lovely craftsmanship", "Beautiful colours and solid work. A little smaller than I imagined, but I still love it."),
    ("Varun P., Pune", 5, "Worth every rupee", "You can feel the effort in every stitch. Happy to support artisans directly."),
]


def seed(session: Session) -> None:
    if session.exec(select(Product)).first():
        return
    artisans = {}
    for a in ARTISANS:
        obj = Artisan(**a)
        session.add(obj)
        session.flush()
        artisans[a["slug"]] = obj

    now = utcnow()
    for i, p in enumerate(PRODUCTS):
        img = p["img"]
        prod = Product(
            slug=p["slug"], name=p["name"], category=p["category"], price=p["price"],
            compare_at_price=p["compare_at_price"], short_description=p["short_description"],
            description=p["description"], images=[f"/images/products/{img}-{n}.jpg" for n in (1, 2, 3)],
            materials=p["materials"], specs=p["specs"], care=p["care"], stock=p["stock"],
            rating=p["rating"], review_count=p["review_count"], popularity=p["popularity"],
            featured=p["featured"], bestseller=p["bestseller"], created_at=now - timedelta(days=p["days_old"]),
            artisan_id=artisans[p["artisan"]].id, qc_status="Passed", qc_checked_on=(now - timedelta(days=p["days_old"] + 3)).strftime("%d %b %Y"),
            qc_checks=QC_CHECKS,
        )
        session.add(prod)
        session.flush()
        for j in range(3):
            author, rating, title, body = REVIEW_POOL[(i + j) % len(REVIEW_POOL)]
            session.add(Review(product_id=prod.id, author=author, rating=rating, title=title, body=body,
                               created_at=now - timedelta(days=3 + j * 9 + i)))
    session.commit()


if __name__ == "__main__":
    if "--reset" in sys.argv:
        SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)
    with Session(engine) as s:
        seed(s)
    print("Seeded.")
