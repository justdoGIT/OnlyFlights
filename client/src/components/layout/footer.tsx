import { Facebook, Twitter, Instagram, Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About Us</h3>
            <p className="text-sm text-gray-600">
              OnlyFlights is your trusted partner for booking flights, hotels, and holiday packages worldwide.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/flights" className="text-sm text-gray-600 hover:text-primary">Flights</a></li>
              <li><a href="/hotels" className="text-sm text-gray-600 hover:text-primary">Hotels</a></li>
              <li><a href="/packages" className="text-sm text-gray-600 hover:text-primary">Holiday Packages</a></li>
              <li><a href="/contact" className="text-sm text-gray-600 hover:text-primary">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                +1 234 567 890
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                support@onlyflights.com
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-primary">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-primary">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-primary">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} OnlyFlights. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}