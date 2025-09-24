import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-filipino-cream to-white py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-inter font-semibold text-filipino-dark mb-6 animate-fade-in">
          Authentic Filipino Flavors, Fresh & Hot
          <span className="block text-filipino-red mt-2">Centro Fresh and Hot Grill</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto animate-slide-up">
          Traditional Filipino dishes, grilled specialties, and home-cooked favorites made fresh daily.
        </p>
        <div className="flex justify-center">
          <a 
            href="#menu"
            className="bg-filipino-red text-white px-8 py-3 rounded-full hover:bg-filipino-adobo transition-all duration-300 transform hover:scale-105 font-medium"
          >
            Explore Menu
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;