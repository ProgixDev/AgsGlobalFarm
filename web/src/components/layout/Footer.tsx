"use client";

import Link from "next/link";
import Image from "next/image";
import {
  FaTiktok,
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaWhatsapp,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="w-full bg-background py-12 lg:py-16">
      <div className="w-full max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
        <hr className="border-t-2 border-primary mb-8" />

        {/* Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 mb-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Image
              src="/Logo.png"
              alt="AGROPASTORAL GLOBALE FARMS"
              width={428}
              height={428}
              className="h-12 w-auto mb-4"
            />
            <p className="text-base font-normal leading-[28px] text-muted-foreground">
              AGROPASTORAL GLOBALE FARMS révolutionne l&apos;agriculture au
              Sénégal en alliant techniques modernes et formation pratique. Nous
              cultivons l&apos;avenir de l&apos;agriculture africaine.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-semibold leading-[25px] text-foreground mb-4">
              Navigation
            </h4>
            <div className="space-y-3">
              <Link
                href="/"
                className="block text-base font-normal leading-5 text-muted-foreground hover:text-green-600 cursor-pointer transition-colors duration-200"
              >
                Accueil
              </Link>
              <Link
                href="/a-propos"
                className="block text-base font-normal leading-5 text-muted-foreground hover:text-green-600 cursor-pointer transition-colors duration-200"
              >
                À propos
              </Link>
              <Link
                href="/formation"
                className="block text-base font-normal leading-5 text-muted-foreground hover:text-green-600 cursor-pointer transition-colors duration-200"
              >
                Formation
              </Link>
              <Link
                href="/boutique"
                className="block text-base font-normal leading-5 text-muted-foreground hover:text-green-600 cursor-pointer transition-colors duration-200"
              >
                Boutique
              </Link>
              <Link
                href="/contact"
                className="block text-base font-normal leading-5 text-muted-foreground hover:text-green-600 cursor-pointer transition-colors duration-200"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xl font-semibold leading-[25px] text-foreground mb-4">
              Nos Services
            </h4>
            <div className="space-y-3">
              <Link
                href="#services"
                className="block text-base font-normal leading-5 text-muted-foreground hover:text-green-600 cursor-pointer transition-colors duration-200"
              >
                Production Agricole
              </Link>
              <Link
                href="#formation"
                className="block text-base font-normal leading-5 text-muted-foreground hover:text-green-600 cursor-pointer transition-colors duration-200"
              >
                Formation Pratique
              </Link>
              <Link
                href="#services"
                className="block text-base font-normal leading-5 text-muted-foreground hover:text-green-600 cursor-pointer transition-colors duration-200"
              >
                Techniques Modernes
              </Link>
              <Link
                href="#services"
                className="block text-base font-normal leading-5 text-muted-foreground hover:text-green-600 cursor-pointer transition-colors duration-200"
              >
                Innovation & Conseil
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xl font-semibold leading-[25px] text-foreground mb-4">
              Ressources
            </h4>
            <div className="space-y-3">
              <Link
                href="#events"
                className="block text-base font-normal leading-5 text-muted-foreground hover:text-green-600 cursor-pointer transition-colors duration-200"
              >
                Événements
              </Link>
              <Link
                href="#blog"
                className="block text-base font-normal leading-5 text-muted-foreground hover:text-green-600 cursor-pointer transition-colors duration-200"
              >
                Blog Agricole
              </Link>
              <Link
                href="#faq"
                className="block text-base font-normal leading-5 text-muted-foreground hover:text-green-600 cursor-pointer transition-colors duration-200"
              >
                FAQ
              </Link>
              <Link
                href="#testimonials"
                className="block text-base font-normal leading-5 text-muted-foreground hover:text-green-600 cursor-pointer transition-colors duration-200"
              >
                Témoignages
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t-2 border-primary/20">
          <p className="text-sm font-medium leading-[17px] text-muted-foreground mb-4 sm:mb-0">
            © 2026 AGROPASTORAL GLOBALE FARMS SARL. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="https://www.facebook.com/share/1B2n3pZo2Q/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-green-600 transition-colors duration-200 hover:scale-110"
              aria-label="Facebook"
            >
              <FaFacebookF className="w-6 h-6" />
            </a>
            <a
              href="https://www.instagram.com/agsglobalfarm?igsh=am12ZjdiejcxOGxy&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-green-600 transition-colors duration-200 hover:scale-110"
              aria-label="Instagram"
            >
              <FaInstagram className="w-6 h-6" />
            </a>
            <a
              href="https://www.tiktok.com/@agsglobalfarm?_r=1&_t=ZS-93jOVOTImou"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-green-600 transition-colors duration-200 hover:scale-110"
              aria-label="TikTok"
            >
              <FaTiktok className="w-6 h-6" />
            </a>
            <a
              href="https://x.com/agsglobalfarm?s=21"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-green-600 transition-colors duration-200 hover:scale-110"
              aria-label="X (Twitter)"
            >
              <FaTwitter className="w-6 h-6" />
            </a>
            <a
              href="https://wa.me/221781383838"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-green-600 transition-colors duration-200 hover:scale-110"
              aria-label="WhatsApp"
            >
              <FaWhatsapp className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
