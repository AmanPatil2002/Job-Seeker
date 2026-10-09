import logo from "../assets/logo.png";

function AboutUs() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <section className="bg-linear-to-r from-indigo-600 to-purple-600 text-white py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-4">About Job Seeker</h1>
          <p className="text-xl">
            Your ultimate destination for discovering job opportunities and
            career development.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <img src={logo} alt="Logo" className="rounded-2xl shadow-lg" />
          </div>

          <div>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Who We Are
            </h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Lorem, ipsum dolor sit amet consectetur adipisicing elit.
              Temporibus numquam odit aperiam facilis. Cumque porro quasi,
              placeat nostrum consectetur iste.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Atque
              corporis ea dolore illo, suscipit consectetur.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
            Why Choose Us?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-2xl shadow-md hover:shadow-xl transition">
              <h3 className="text-xl font-semibold mb-3">Huge Collection</h3>
              <p className="text-gray-600">
                Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                Aspernatur, voluptates.
              </p>
            </div>
            <div className="bg-gray-50 p-8 rounded-2xl shadow-md hover:shadow-xl transition">
              <h3 className="text-xl font-semibold mb-3">Ratings & Reviews</h3>
              <p className="text-gray-600">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eaque,
                dolor.
              </p>
            </div>
            <div className="bg-gray-50 p-8 rounded-2xl shadow-md hover:shadow-xl transition">
              <h3 className="text-xl font-semibold mb-3">24/7 Support</h3>
              <p className="text-gray-600">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eaque,
                dolor.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-indigo-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold mb-4">Start Exploring Today</h2>
          <p className="mb-6 text-lg">
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Corporis
            atque error hic laborum impedit quo harum voluptatum eaque eos
            architecto.
          </p>
          <a href="/home">
            <button className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition">
              Browse Jobs
            </button>
          </a>
        </div>
      </section>
    </div>
  );
}

export default AboutUs;
