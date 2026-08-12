"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";
import {
  FaTiktok,
  FaInstagram,
  FaFacebookF,
  FaTwitter,
  FaWhatsapp,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { sendContactEmail } from "@/lib/db";

const contactInfo = [
  {
    icon: Phone,
    title: "Téléphone",
    details: ["+221781383838 "],
    description: "Lun - Ven : 8h - 13h",
    link: "tel:+221781383838",
  },
  {
    icon: Mail,
    title: "Email",
    details: ["contact@agsglobalfarm.com"],
    description: "Réponse sous 24h",
    link: "mailto:contact@agsglobalfarm.com",
  },
  {
    icon: MapPin,
    title: "Adresse",
    details: ["Cité nouvel horizon, villa 642", "Keur Ndiaye LO, Dakar"],
    description: "Visitez-nous sur rendez-vous",
    link: "https://www.google.com/maps/search/?api=1&query=Cité+nouvel+horizon+villa+642+Keur+Ndiaye+LO+Dakar",
  },
  {
    icon: Clock,
    title: "Horaires",
    details: ["Lun - Ven : 8h00 - 13h00"],
    description: "Fermé samedi et dimanche",
  },
];

const socialMedia = [
  {
    name: "Facebook",
    icon: FaFacebookF,
    url: "https://www.facebook.com/share/1B2n3pZo2Q/?mibextid=wwXIfr",
    color: "#1877F2",
  },
  {
    name: "Instagram",
    icon: FaInstagram,
    url: "https://www.instagram.com/agsglobalfarm?igsh=am12ZjdiejcxOGxy&utm_source=qr",
    color: "#E4405F",
  },
  {
    name: "TikTok",
    icon: FaTiktok,
    url: "https://www.tiktok.com/@agsglobalfarm?_r=1&_t=ZS-93jOVOTImou",
    color: "#000000",
  },
  {
    name: "X (Twitter)",
    icon: FaTwitter,
    url: "https://x.com/agsglobalfarm?s=21",
    color: "#1DA1F2",
  },
  {
    name: "WhatsApp",
    icon: FaWhatsapp,
    url: "https://wa.me/221781383838",
    color: "#25D366",
  },
];

const faqs = [
  {
    question: "Quels sont vos délais de livraison ?",
    answer:
      "Nos délais de livraison varient entre 24h et 72h selon votre localisation et la disponibilité des produits.",
  },
  {
    question: "Proposez-vous des formations ?",
    answer:
      "Oui, nous proposons des formations animées par des experts avec des contenus théoriques et des pratiques sur terrain.",
  },
  {
    question: "Comment puis-je devenir partenaire ?",
    answer:
      "Contactez-nous à contact@agsglobalfarm.com avec votre proposition de collaboration.",
  },
  {
    question: "Offrez-vous des services de conseil ?",
    answer:
      "Oui, notre équipe d'experts propose des services de conseil personnalisés pour vos projets agricoles.",
  },
];

function ContactPageContent() {
  const searchParams = useSearchParams();
  const backgroundColor = window.getComputedStyle(
    document.body,
  ).backgroundColor;
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const initializedRef = useRef(false);

  // Pre-fill form from query parameters
  useEffect(() => {
    if (initializedRef.current) return;

    const subject = searchParams.get("subject");
    const program = searchParams.get("program");
    const event = searchParams.get("event");

    if (subject || program || event) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData((prev) => {
        const updates: Partial<typeof prev> = {};

        if (subject) {
          updates.subject =
            subject === "training"
              ? "training"
              : subject === "event"
                ? "event"
                : subject;
        }

        if (program) {
          updates.message = `Bonjour,\n\nJe souhaite m'inscrire à la formation : ${decodeURIComponent(
            program,
          )}\n\nMerci de me contacter pour plus d'informations.\n\nCordialement,`;
        } else if (event) {
          updates.message = `Bonjour,\n\nJe souhaite réserver une place pour l'événement : ${decodeURIComponent(
            event,
          )}\n\nMerci de me contacter pour confirmer ma réservation.\n\nCordialement,`;
        }

        return { ...prev, ...updates };
      });
      initializedRef.current = true;
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await sendContactEmail(formData);

      if (result.success) {
        setIsSubmitted(true);
        setTimeout(() => {
          setIsSubmitted(false);
          setFormData({
            name: "",
            email: "",
            phone: "",
            subject: "",
            message: "",
          });
        }, 5000);
      } else {
        setErrorMessage(result.error || "Une erreur s'est produite");
      }
    } catch {
      setErrorMessage("Une erreur s'est produite lors de l'envoi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-28 pb-32 overflow-hidden bg-emerald-900">
        <div className="absolute inset-0 opacity-10">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
          </svg>
        </div>

        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(var(--color-brand) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        ></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span
                className="inline-block py-2 px-4 rounded text-white text-sm font-medium mb-4 border"
                style={{
                  backgroundColor: "var(--color-secondary-brand)",
                  borderColor: "var(--color-secondary-brand)",
                }}
              >
                Nous sommes là pour vous
              </span>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Contactez-Nous
              </h1>
              <p className="text-white/90 text-lg mb-10 max-w-3xl mx-auto">
                Une question, un projet, une collaboration ? Notre équipe est à
                votre écoute pour vous accompagner dans vos ambitions agricoles.
              </p>

              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  size="lg"
                  className="text-white text-base font-semibold shadow-lg hover:shadow-xl transition-all bg-(--color-cta)"
                  asChild
                  onClick={() => {
                    const contactForm = document.getElementById("contact-form");
                    if (contactForm) {
                      contactForm.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                >
                  <Link href="/contact#contact-form">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Envoyer un Message
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 text-base font-semibold"
                  asChild
                >
                  <Link href="tel:+221781383838">
                    <Phone className="w-5 h-5 mr-2" />
                    +221781383838
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Decorative Wave Bottom */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180">
          <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="relative block w-[calc(100%+1.3px)] h-15"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              fill={backgroundColor}
            ></path>
          </svg>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 relative">
        {/* Gradient overlay at the top to blend */}
        <div
          className="absolute top-0 left-0 right-0 h-32 pointer-events-none -mt-1"
          style={{
            background: `linear-gradient(to bottom, ${backgroundColor}, transparent)`,
          }}
        ></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr">
            {contactInfo.map((info, index) => {
              const content = (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all group h-full"
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: "var(--color-brand)" }}
                  >
                    <info.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-3">
                    {info.title}
                  </h3>
                  <div className="space-y-1 mb-2">
                    {info.details.map((detail, idx) => (
                      <p
                        key={idx}
                        className="text-gray-700 font-medium text-sm"
                      >
                        {detail}
                      </p>
                    ))}
                  </div>
                  <p className="text-gray-500 text-xs">{info.description}</p>
                </motion.div>
              );

              return info.link ? (
                <a
                  key={index}
                  href={info.link}
                  target={info.link.startsWith("http") ? "_blank" : undefined}
                  rel={
                    info.link.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="block"
                >
                  {content}
                </a>
              ) : (
                content
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form & Departments */}
      <section id="contact-form" className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-lg flex flex-col"
            >
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Envoyez-nous un Message
                </h2>
                <p className="text-gray-600">
                  Remplissez le formulaire ci-dessous et nous vous répondrons
                  dans les plus brefs délais.
                </p>
              </div>

              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: "var(--color-brand)" }}
                  >
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Message Envoyé !
                  </h3>
                  <p className="text-gray-600">
                    Merci pour votre message. Notre équipe vous contactera
                    bientôt.
                  </p>
                </motion.div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-5 flex flex-col flex-1"
                >
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom Complet <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                        placeholder="Votre nom"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                        placeholder="+221 XXX XXX XXX"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sujet <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                      >
                        <option value="">Sélectionnez un sujet</option>
                        <option value="products">Produits et commandes</option>
                        <option value="training">Formations</option>
                        <option value="event">Événements</option>
                        <option value="partnership">Partenariats</option>
                        <option value="technical">Support technique</option>
                        <option value="other">Autre</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={10}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none min-h-70 flex-1"
                      placeholder="Décrivez votre demande en détail..."
                    ></textarea>
                  </div>

                  {errorMessage && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {errorMessage}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-base font-semibold mt-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Envoyer le Message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </motion.div>

            {/* Departments Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {/* Social Media */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Suivez-Nous
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Restez connectés pour nos dernières actualités et conseils
                  agricoles.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {socialMedia.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-green-500 transition-all group"
                    >
                      <social.icon
                        className="w-5 h-5 group-hover:scale-110 transition-transform"
                        style={{ color: social.color }}
                      />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-green-600">
                        {social.name}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Questions Fréquentes
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Trouvez rapidement les réponses aux questions les plus courantes.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-md"
              >
                <h3 className="font-bold text-gray-900 mb-2 flex items-start gap-2">
                  <span
                    className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-bold"
                    style={{ backgroundColor: "var(--color-secondary-brand)" }}
                  >
                    ?
                  </span>
                  {faq.question}
                </h3>
                <p className="text-gray-600 text-sm pl-8">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      }
    >
      <ContactPageContent />
    </Suspense>
  );
}
