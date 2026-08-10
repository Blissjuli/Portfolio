

window.BLISS_CONTENT = (() => {
  "use strict";

  const KEY = "blissjuli.content.v1";

  const defaults = {
    site: {
      greeting: "Hello, I'm",
      firstName: "Blaise",
      lastName: "Chiamaka",
      tagline:
        'I build modern websites and web applications end-to-end — and as founder of <strong>Bliss Juli Limited</strong>, I bring the same craft to fashion and baking.',
      email: "chidiblaise2023@gmail.com",
      phone: "+234 703 782 9449",
      phoneRaw: "+2347037829449",
      location: "Aba, Abia State, Nigeria",
      whatsapp: "2347037829449",
      formSubject: "New message from Bliss Juli's portfolio",
      footerBio:
        "Fashion designer & caterer creating stunning custom outfits and delicious event catering from Aba, Nigeria.",
      newsletterNote: "Get style tips and menu ideas. No spam.",
      copyright: "Bliss Juli's Limitted. All rights reserved.",
      socials: {
        facebook: "https://www.facebook.com/profile.php?id=61580674795761",
        instagram: "https://www.instagram.com/blissjuliluxury",
        x: "https://x.com/Blissjuliluxury",
        tiktok: "",
        whatsapp: "https://wa.me/2347037829449",
      },
    },

    texts: {
      roles: [
        "Full Stack Developer",
        "Fashion Designer",
        "Baker & Cake Artist",
        "Web Designer",
      ],
      footer: [
        "@ Bliss Juli's Limitted. All rights reserved.",
        "Welcome to my portfolio...",
        "I create beautiful outfits and delicious food...",
        "Let's work together!",
      ],
      about: [
        "I'm a Fashion Designer passionate about creating beautiful, custom outfits that fit perfectly",
        "I combine creativity and craftsmanship to design elegant bridal, traditional and occasion wear.",
        "I also cater events — cooking, baking and presenting food your guests will love.",
        "I'll love to style your next outfit or event with you.",
      ],
    },

    services: [
      {
        icon: 0,
        title: "Full Stack Development",
        desc: "Complete web applications — frontend, backend and database — designed, built and deployed end-to-end.",
        filter: "Full Stack",
      },
      {
        icon: 1,
        title: "Website Design",
        desc: "Premium, modern website designs that turn your brand into an unforgettable digital experience.",
        filter: "Frontend",
      },
      {
        icon: 2,
        title: "Database Design",
        desc: "Well-structured databases with MySQL, MongoDB, Supabase or Firebase — modelled for growth.",
        filter: "Full Stack",
      },
      {
        icon: 3,
        title: "Fashion Design",
        desc: "Custom outfits and occasion wear designed, cut and finished to a perfect fit — via Bliss Juli Limited.",
        filter: "Fashion",
      },
      {
        icon: 4,
        title: "Cake & Pastry Services",
        desc: "Freshly baked cakes and pastries for birthdays, weddings and celebrations — via Bliss Juli Limited.",
        filter: "Bakery",
      },
    ],

    projects: {
      p1: {
        title: "Love Story Interactive Website",
        category: "Full Stack",
        description:
          "A romantic interactive website with music, playful questions and hidden surprises — built for proposals and confessions.",
        client: "Personal Project",
        date: "2026",
        image: "image/love-story-hero.jpg",
        live: "https://love-web-wheat.vercel.app/",
        github: "https://github.com/blissjuli",
        overview:
          "A romantic interactive website that guides visitors through a love story — choosing gender, answering fun questions, listening to music and opening hidden surprises.",
        problem:
          "How to make a confession or proposal feel personal, exciting and memorable instead of a plain text message.",
        solution:
          "I built a step-by-step interactive flow with music, playful questions and gift-box surprises that reveal sweet messages at the end.",
        features: [
          "Gender-based story flow",
          "Background music",
          "Interactive questions",
          "Hidden surprise boxes",
          "Mobile-friendly",
        ],
        shots: ["image/love-story-hero.jpg"],
        tech: ["HTML", "CSS", "JavaScript", "Vercel"],
        role: "Creator & Builder",
        challenges:
          "Keeping the flow smooth on mobile phones and making the surprises work reliably on every device.",
        outcome:
          "The site is live on Vercel and ready to share — a fun, shareable experience for love stories.",
        feedback:
          "Send the link to your special someone and watch the magic happen!",
      },
      p2: {
        title: "To-Do List App",
        category: "Frontend",
        description:
          "A clean, interactive to-do list app for planning daily tasks — add, complete and delete tasks with ease.",
        client: "Personal Project",
        date: "2026",
        image: "image/todo-hero.jpg",
        live: "https://to-do-list-woad-tau-51.vercel.app",
        github: "https://github.com/blissjuli",
        overview:
          "A polished to-do list web app that helps you capture, organise and complete daily tasks from any device.",
        problem:
          "Staying on top of multiple daily tasks without a simple, fast way to track them.",
        solution:
          "I built a lightweight app with instant add, complete and delete interactions, progress feedback and local storage persistence.",
        features: [
          "Add & organise tasks",
          "Mark tasks complete",
          "Delete with one click",
          "Progress counter",
          "Local storage save",
        ],
        shots: ["image/todo-hero.jpg"],
        tech: ["HTML", "CSS", "JavaScript", "LocalStorage"],
        role: "Designer & Developer",
        challenges:
          "Keeping the interface snappy and the data saved across refreshes — solved with localStorage.",
        outcome:
          "A fast, satisfying task manager used to plan weekly goals and stay organised.",
        feedback: "Simple, quick and genuinely helpful for daily planning.",
      },
      p3: {
        title: "Bliss Juli Fashion Website",
        category: "Fashion",
        description:
          "A premium fashion brand website for Bliss Juli Limited — showcasing custom clothing and style services.",
        client: "Bliss Juli Limited",
        date: "2026",
        image: "image/fashion-boutique.jpg",
        live: "https://blisjuli-luxury-fashion.vercel.app/",
        github: "https://github.com/blissjuli",
        overview:
          "A premium fashion brand website for Bliss Juli Limited — presenting the clothing line, collections and services in an elegant, on-brand experience.",
        problem:
          "The fashion brand needed an elegant online presence that matched its premium handmade clothing.",
        solution:
          "I designed and built a polished site with a refined palette, beautiful product presentation and clear paths for orders and enquiries.",
        features: [
          "Elegant brand design",
          "Collection showcase",
          "Service pages",
          "Order enquiry flow",
          "Responsive layout",
        ],
        shots: ["image/fashion-boutique.jpg"],
        tech: ["HTML", "CSS", "JavaScript", "Vercel"],
        role: "Web Designer & Developer",
        challenges:
          "Capturing the feel of premium custom tailoring in a digital experience.",
        outcome:
          "A site that presents the fashion brand beautifully and turns visitors into enquiries.",
        feedback:
          "Live link coming soon — I will attach the preview when it is ready.",
      },
      p4: {
        title: "Custom Cakes & Pastries",
        category: "Bakery",
        description:
          "Freshly baked celebration cakes and pastries, beautifully decorated — via Bliss Juli Limited.",
        client: "Bliss Juli Limited",
        date: "2026",
        image: "image/cakes-pastries.jpg",
        live: "#",
        github: "#",
        overview:
          "Freshly baked, custom-decorated celebration cakes and pastries made to order for birthdays, weddings and parties.",
        problem:
          "Clients want celebration cakes that match their theme and taste as good as they look.",
        solution:
          "I bake fresh layers, craft smooth custom frosting and hand-decorate each order in the client's chosen colours and style.",
        features: [
          "Custom design",
          "Freshly baked",
          "Themed decoration",
          "On-time delivery",
        ],
        shots: [
          "image/cakes-pastries.jpg",
          "image/cake-gallery-tiered.jpg",
          "image/cake-gallery-wedding.jpg",
          "image/cake-gallery-cupcakes.jpg",
          "image/cake-gallery-pastries.jpg",
        ],
        tech: ["Baking", "Cake Decoration", "Food Styling"],
        role: "Baker & Cake Artist",
        challenges: "Matching exact theme colours and flavours for every order.",
        outcome: "Happy clients and a growing list of repeat celebration orders.",
        feedback:
          '"It looked even better than the picture I sent — so delicious!"',
      },
      p5: {
        title: "Personal Portfolio Website",
        category: "Frontend",
        description:
          "This website — my personal portfolio, built with pure HTML, CSS and JavaScript to showcase my work.",
        client: "Personal Project",
        date: "2026",
        image: "image/portfolio-hero.jpg",
        live: "#",
        github: "https://github.com/blissjuli",
        overview:
          "This website is my personal portfolio, built with pure HTML, CSS and JavaScript to present my services, projects and story to potential clients and employers.",
        problem:
          "I needed a professional home for my work that felt premium, fast and personal.",
        solution:
          "I designed and hand-coded a cinematic single-page portfolio with smooth animations, a project modal and a full case-study system.",
        features: [
          "Cinematic design",
          "Project case studies",
          "Interactive timeline",
          "Contact & newsletter forms",
          "Accessibility + reduced motion",
        ],
        shots: ["image/portfolio-hero.jpg"],
        tech: ["HTML", "CSS", "JavaScript"],
        role: "Designer & Developer",
        challenges:
          "Keeping animations buttery-smooth while respecting reduced-motion preferences.",
        outcome:
          "A professional home that presents the work, story and contact points clearly.",
        feedback: "It's my favourite corner of the internet — mine.",
      },
    },

    articles: [
      {
        title: "Building Your First Full Stack App: A Simple Roadmap",
        tag: "Web Dev",
        date: "Jun 2026",
        readTime: "6 min read",
        excerpt:
          "From idea to deployed product — the exact steps I follow for every project…",
        icon: 0,
        paragraphs: [
          "Every full stack app I build follows the same simple roadmap — start with the problem, sketch the flow, then build front to back. This post walks through those exact steps so you can ship your first complete application too.",
          "Step one is the idea. Write down the one problem the app solves and who it serves. Keep it tiny: a to-do list, a portfolio, a simple booking page. A small, finished app beats a large, unfinished one every time.",
          "Step two is the plan. Sketch the screens on paper, list the features, and decide what data the app needs to store. This becomes your map — it stops you from getting lost halfway through.",
          "Step three is the build. Start with the frontend so you can see your work come to life, then add the backend and database behind it. Keep each feature small, test it in the browser, and move on.",
          "Step four is deployment. I deploy on Vercel — connect your Git repository, push, and your app goes live in minutes. Then share the link and celebrate. Every deployed project teaches you more than any tutorial.",
        ],
        takeaways: [
          "Define one small problem before you write any code.",
          "Sketch the screens and data before building.",
          "Frontend first, then backend — test as you go.",
          "Deploy early; a live link is better than perfect code.",
        ],
      },
      {
        title: "Running a Creative Business with Digital Tools",
        tag: "Style & Tech",
        date: "Apr 2026",
        readTime: "5 min read",
        excerpt:
          "How I manage Bliss Juli Limited — bookings, payments and marketing made easy…",
        icon: 1,
        paragraphs: [
          "Running a creative business like Bliss Juli Limited means balancing design, orders and customers every single day. Digital tools turn that chaos into a calm, repeatable system.",
          "Bookings come first. Keep every order in one place — a simple spreadsheet works — with columns for the client, the item, the size, the deadline and the price. When everything lives in one list, nothing slips through the cracks.",
          "Payments come second. Offer clear, upfront pricing and record every payment the moment it arrives. A consistent price list builds trust and stops awkward conversations later.",
          "Marketing comes third. Post finished work regularly — photos of outfits and cakes are your best salespeople. Post a consistent schedule, reply to every message, and let happy customers share your name.",
          "The goal is simple: a business you can run without stress. Choose a few tools, master them, and let them carry the admin so you can focus on the craft.",
        ],
        takeaways: [
          "Centralise every order in one list.",
          "Set clear prices and record payments daily.",
          "Post finished work consistently.",
          "Reply fast — word of mouth is your best ad.",
        ],
      },
      {
        title: "Choosing the Perfect Cake for Your Celebration",
        tag: "Baking",
        date: "Feb 2026",
        readTime: "4 min read",
        excerpt:
          "Flavours, sizes and designs — a quick guide to ordering your dream cake…",
        icon: 2,
        paragraphs: [
          "The perfect celebration cake comes down to three things: how many guests you're feeding, what flavours everyone will love, and the design that matches your theme. Get those right and the cake becomes the highlight of the event.",
          "Start with size. A single tier serves around 10 to 15 people; add a tier for every extra group of guests. When in doubt, I recommend rounding up — leftover cake is rarely a problem.",
          "Next, flavours. Vanilla and chocolate are safe favourites, while red velvet, lemon and marble add something special. I always bake fresh layers so the cake stays moist and rich on the day.",
          "Then design. Send reference photos of colours and styles you love. I hand-decorate each order in your chosen palette — smooth frosting, themed toppers and clean finishing that looks as good as it tastes.",
          "Finally, order ahead. Cakes need time to bake, cool and decorate, so place your order at least a week before your celebration for the best result.",
        ],
        takeaways: [
          "Size the cake to your guest count.",
          "Pick crowd-pleasing flavours that bake well.",
          "Share reference photos for the design.",
          "Order at least a week in advance.",
        ],
      },
    ],

    testimonials: [
      {
        quote:
          '"Blaise built my business website from scratch — fast, clean and beautiful on mobile. She explained everything and delivered exactly what I asked for."',
        name: "David O.",
        company: "Business Owner — Website Project",
      },
      {
        quote:
          '"Blaise made my wedding gown and it was exactly what I dreamed of — the fitting was perfect and the finishing was so clean. She\'s a true artist!"',
        name: "Ngozi C.",
        company: "Bride — Wedding Gown & Gele",
      },
      {
        quote:
          '"She baked my daughter\'s birthday cake and it was the star of the party — delicious and beautifully decorated. Highly recommended!"',
        name: "Kelechi E.",
        company: "Birthday Cake Client",
      },
      {
        quote:
          '"The agbada and native set she made for me was sharp! Great measurements, on time, and the embroidery was top quality. I always come back."',
        name: "Ada O.",
        company: "Customer, Traditional Attire",
      },
      {
        quote:
          '"From planning to delivery, everything ran smoothly. She\'s professional, creative and genuinely cares about the result — I\'ll work with her again."',
        name: "Sandra O.",
        company: "Event Client",
      },
    ],
  };

  function mergeDeep(base, overrides) {
    if (!overrides || typeof overrides !== "object") return base;
    if (Array.isArray(base)) return overrides;
    const out = { ...base };
    for (const key of Object.keys(overrides)) {
      if (!(key in base)) {
        out[key] = overrides[key];
        continue;
      }
      const b = base[key];
      const o = overrides[key];
      if (
        o &&
        typeof o === "object" &&
        b &&
        typeof b === "object" &&
        !Array.isArray(b)
      ) {
        out[key] = mergeDeep(b, o);
      } else {
        out[key] = o;
      }
    }
    return out;
  }

  
  const URL_SENTINEL_FIELDS = ["live", "github", "video"];

  
  function healSentinelLinks(content) {
    const baseProjects = defaults.projects || {};
    const contentProjects = content.projects || {};
    for (const key of Object.keys(contentProjects)) {
      const base = baseProjects[key];
      const project = contentProjects[key];
      if (!base || typeof base !== "object" || typeof project !== "object") {
        continue;
      }
      for (const field of URL_SENTINEL_FIELDS) {
        const bv = base[field];
        const ov = project[field];
        if (!ov && bv) {
          project[field] = bv;
        } else if (ov === "#" && bv && bv !== "#") {
          project[field] = bv;
        }
      }
    }
  }

  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(KEY) || "null");
  } catch (e) {
    saved = null;
  }

  const content = saved ? mergeDeep(defaults, saved) : defaults;
  healSentinelLinks(content);

  function persistLocal() {
    try {
      localStorage.setItem(KEY, JSON.stringify(content));
      return true;
    } catch (e) {
      return false;
    }
  }

  async function applyRemote() {
    const fb = window.BLISS_FIREBASE;
    if (!fb || !fb.available) return false;
    let result = null;
    try {
      result = await fb.load();
    } catch (e) {
      result = null;
    }
    
    const legacy = result && typeof result === "object" && !("ok" in result);
    const remote = legacy ? result : result && result.ok ? result.data : null;
    if (!remote) return false;
    const merged = mergeDeep(defaults, remote);
    Object.keys(merged).forEach((key) => {
      content[key] = merged[key];
    });
    healSentinelLinks(content);
    persistLocal();
    return true;
  }

  function restoreDefaults() {
    const fresh = JSON.parse(JSON.stringify(defaults));
    Object.keys(content).forEach((key) => delete content[key]);
    Object.assign(content, fresh);
    persistLocal();
    return content;
  }

  window.BLISS_CONTENT_STORE = {
    key: KEY,
    read() {
      return content;
    },
    async save() {
      const ok = persistLocal();
      const fb = window.BLISS_FIREBASE;
      let remote = { ok: true, permissionDenied: false, offline: false };
      if (fb && fb.available) {
        const result = await fb.save(content);
        if (result && typeof result === "object" && "ok" in result) {
          remote = result;
        } else {
          
          remote = { ok: !!result, permissionDenied: false, offline: !result };
        }
      } else {
        remote.offline = true;
      }
      return { ok, remote };
    },
    clear() {
      try {
        localStorage.removeItem(KEY);
      } catch (e) {}
    },
    applyRemote,
    restoreDefaults,
  };

  return content;
})();


window.BLISS_ICONS = (() => {
  const wrap = (inner) =>
    `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;

  return {
    service: [
      wrap('<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>'),
      wrap(
        '<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>'
      ),
      wrap(
        '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>'
      ),
      wrap(
        '<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>'
      ),
      wrap(
        '<path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><path d="M6 17h12"/>'
      ),
    ],
    article: [
      wrap('<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>'),
      wrap(
        '<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>'
      ),
      wrap(
        '<path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><path d="M6 17h12"/>'
      ),
    ],
  };
})();


window.BLISS_UTIL = (() => {
  "use strict";

  
  const esc = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  return { esc };
})();
