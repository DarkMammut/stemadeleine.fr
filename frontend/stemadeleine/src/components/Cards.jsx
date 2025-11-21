import { Link } from "react-router-dom";
import React from "react";

export default function Cards() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Découvrir nos pages
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Link
            to={""}
            className="block bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6"
          >
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Test</h3>
            <p className="text-gray-600 line-clamp-3">test</p>
            <div className="mt-4 text-primary font-medium">
              En savoir plus →
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
