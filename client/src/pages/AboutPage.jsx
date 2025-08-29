import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import developerImage from "../assets/developer_image.jpg";

const AboutPage = () => {
  const achievements = [
    {
      icon: "🎓",
      title: "Computer Science Graduate",
      description:
        "Strong foundation in software engineering and system design",
    },
    {
      icon: "💻",
      title: "Full-Stack Developer",
      description: "Expertise in modern web technologies and frameworks",
    },
    {
      icon: "🚀",
      title: "Innovation Focused",
      description:
        "Passionate about creating solutions that solve real-world problems",
    },
    {
      icon: "🌐",
      title: "Open Source Contributor",
      description: "Active participant in the developer community",
    },
  ];

  const technologies = [
    "React.js",
    "Node.js",
    "Express.js",
    "PostgreSQL",
    "Socket.IO",
    "JavaScript",
    "Python",
    "Java",
    "Git",
    "Docker",
    "AWS",
    "MongoDB",
  ];

  const projectFeatures = [
    {
      title: "Real-time Communication",
      description: "Implemented WebSocket-based live messaging and updates",
      tech: "Socket.IO, React Hooks",
    },
    {
      title: "Secure Authentication",
      description: "JWT-based authentication with email verification",
      tech: "JWT, Bcrypt, Nodemailer",
    },
    {
      title: "Database Design",
      description: "Robust PostgreSQL schema with Sequelize ORM",
      tech: "PostgreSQL, Sequelize",
    },
    {
      title: "Modern UI/UX",
      description: "Responsive design with smooth animations",
      tech: "Tailwind CSS, Framer Motion",
    },
    {
      title: "RESTful API",
      description: "Well-structured backend with comprehensive error handling",
      tech: "Express.js, Middleware",
    },
    {
      title: "State Management",
      description: "Efficient client-side state management and caching",
      tech: "React Context, Custom Hooks",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden shadow-lg border-4 border-indigo-200">
              <img
                src={developerImage}
                alt="Ehteshamul Haque Adit"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Ehteshamul Haque Adit
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl md:text-2xl text-indigo-600 font-semibold mb-6"
          >
            Creator & Lead Developer of Dealmaker
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed"
          >
            A passionate full-stack developer dedicated to creating innovative
            solutions that bridge the gap between technology and real-world
            business needs.
          </motion.p>
        </div>
      </motion.section>

      {/* About Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                About the Creator
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Ehteshamul Haque Adit is a dedicated software engineer with a
                  passion for creating innovative web applications that solve
                  real-world problems. With expertise in both frontend and
                  backend development, he brings a comprehensive approach to
                  building scalable and user-friendly applications.
                </p>
                <p>
                  The Dealmaker platform represents his vision of streamlining
                  business transactions through technology, providing a secure
                  and efficient environment for dealers and dealmakers to
                  connect and collaborate.
                </p>
                <p>
                  His development philosophy centers around creating clean,
                  maintainable code while prioritizing user experience and
                  system reliability. Every feature in Dealmaker has been
                  carefully crafted with attention to detail and performance.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="flex flex-col items-center"
            >
              <div className="w-64 h-64 mb-8 rounded-lg overflow-hidden shadow-xl border-4 border-indigo-100">
                <img
                  src={developerImage}
                  alt="Ehteshamul Haque Adit - Creator of Dealmaker"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="text-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-300"
                  >
                    <div className="text-2xl mb-2">{achievement.icon}</div>
                    <h3 className="text-xs font-semibold text-gray-900 mb-1">
                      {achievement.title}
                    </h3>
                    <p className="text-xs text-gray-600">
                      {achievement.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Technical Skills Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Technical Expertise
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Technologies and frameworks used to build the Dealmaker platform
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {technologies.map((tech, index) => (
              <motion.span
                key={tech}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="bg-white hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:text-indigo-600 transition-all duration-300 cursor-default"
              >
                {tech}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Project Features Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Project Architecture & Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Key technical implementations that power the Dealmaker platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projectFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 hover:bg-gray-100 p-6 rounded-lg border border-gray-200 hover:border-indigo-300 transition-all duration-300"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {feature.description}
                </p>
                <div className="text-sm text-indigo-600 font-medium">
                  {feature.tech}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Development Philosophy Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Development Philosophy
            </h2>
            <blockquote className="text-xl md:text-2xl text-indigo-100 italic mb-8 leading-relaxed">
              "Technology should serve people, not the other way around. Every
              line of code should have a purpose, and every feature should solve
              a real problem."
            </blockquote>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
                <div>
                  <h3 className="font-semibold mb-2">User-Centric Design</h3>
                  <p className="text-indigo-100 text-sm">
                    Every feature is designed with the end-user experience in
                    mind
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Performance First</h3>
                  <p className="text-indigo-100 text-sm">
                    Optimized code and efficient architecture for maximum speed
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Security & Reliability</h3>
                  <p className="text-indigo-100 text-sm">
                    Robust security measures and error handling throughout
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact/Connect Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Connect & Collaborate
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Interested in the project or want to collaborate? Feel free to
              explore the platform and experience the features firsthand.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/deals"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105"
              >
                Explore Deals
              </Link>
              <Link
                to="/"
                className="bg-white hover:bg-gray-50 text-indigo-600 border-2 border-indigo-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105"
              >
                Back to Home
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer Credits */}
      <footer className="px-4 py-8 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-300 mb-2">© 2025 Dealmaker Platform</p>
            <p className="text-gray-400 text-sm">
              Designed and developed with ❤️ by Ehteshamul Haque Adit
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
