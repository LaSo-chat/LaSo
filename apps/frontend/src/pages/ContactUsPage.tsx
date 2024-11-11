import NavBar from "@/components/ui/NavBar";
import React from "react";
import { Card } from "@/components/ui/card";
import { BsInstagram, BsTelegram, BsWhatsapp } from "react-icons/bs";
import { FaFacebookF } from "react-icons/fa";
import { BiPhone } from "react-icons/bi";
import { HiOutlineMail } from "react-icons/hi";

const ContactUsPage: React.FC = () => {
  const contactMethods = [
    {
      title: "Call us",
      icon: <BiPhone className="w-6 h-6 text-white" />,
      availability: "Our team is on the line Mon-Fri • 9-17",
    },
    {
      title: "Email us",
      icon: <HiOutlineMail className="w-6 h-6 text-white" />,
      availability: "Our team is online Mon-Fri • 9-17",
    },
  ];

  const socialMedia = [
    {
      platform: "Instagram",
      icon: <BsInstagram className="w-6 h-6" />,
      followers: "4.6K Followers",
      posts: "118 Posts",
    },
    {
      platform: "Telegram",
      icon: <BsTelegram className="w-6 h-6" />,
      followers: "1.3K Followers",
      posts: "85 Posts",
    },
    {
      platform: "Facebook",
      icon: <FaFacebookF className="w-6 h-6" />,
      followers: "3.8K Followers",
      posts: "136 Posts",
    },
    {
      platform: "WhatsUp",
      icon: <BsWhatsapp className="w-6 h-6" />,
      availability: "Available Mon-Fri • 9-17",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="fixed top-0 w-full bg-white shadow-md z-10 flex items-center p-4">
        <h3 className="text-xl ml-4 font-semibold">Contact Us</h3>
      </div>

      <main className="mt-20 px-4 pb-20">
        <p className="text-gray-600 mb-6">
          Don't hesitate to contact us whether you have a suggestion on our
          improvement, a complain to discuss or an issue to solve.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {contactMethods.map((method, index) => (
            <Card
              key={index}
              className="p-4 flex flex-col items-center justify-center bg-white rounded-xl"
            >
              <div className="bg-black p-3 rounded-lg mb-2">{method.icon}</div>
              <h3 className="font-medium mb-1">{method.title}</h3>
              <p className="text-xs text-gray-500 text-center">
                {method.availability}
              </p>
            </Card>
          ))}
        </div>

        <div className="space-y-3">
          <h4 className="text-gray-500 text-sm mb-2">
            Contact us in Social Media
          </h4>
          {socialMedia.map((platform, index) => (
            <Card
              key={index}
              className="p-4 flex items-center justify-between bg-white rounded-xl"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-gray-100 p-2 rounded-lg">
                  {platform.icon}
                </div>
                <div>
                  <h3 className="font-medium">{platform.platform}</h3>
                  <p className="text-xs text-gray-500">
                    {platform.followers && platform.posts
                      ? `${platform.followers} • ${platform.posts}`
                      : platform.availability}
                  </p>
                </div>
              </div>
              <button className="text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
              </button>
            </Card>
          ))}
        </div>
      </main>

      <NavBar />
    </div>
  );
};

export default ContactUsPage;
