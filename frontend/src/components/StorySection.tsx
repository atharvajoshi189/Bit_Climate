// src/components/StorySection.tsx

import React from 'react';
import { User, Building, ExternalLink } from 'lucide-react';
import { Story } from '@/lib/storiesData'; // Import the type definition

interface StorySectionProps {
  title: string;
  stories: Story[];
}

export default function StorySection({ title, stories }: StorySectionProps) {
  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-white">{title}</h2>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 gap-12">
          {stories.map((story, index) => (
            <div key={index} className="bg-[#161B22]/70 backdrop-blur-md p-8 rounded-2xl border border-gray-700 flex flex-col md:flex-row items-center gap-8">
              <img src={story.photo} alt={story.name} className="w-40 h-40 object-cover rounded-2xl flex-shrink-0 shadow-lg"/>
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  {story.type === 'person' ? <User className="h-6 w-6 text-teal-400"/> : <Building className="h-6 w-6 text-teal-400"/>}
                  <h3 className="text-2xl font-bold text-white">{story.name}</h3>
                </div>
                <p className="text-gray-400 leading-relaxed mb-4">{story.description}</p>
                <a 
                  href={story.wikipediaUrl}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Read More <ExternalLink size={16} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}