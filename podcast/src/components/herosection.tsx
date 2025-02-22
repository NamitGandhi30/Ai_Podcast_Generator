
export default function Hero() {
    return (
      <section 
        className="relative bg-gray-900 text-white h-screen flex flex-col justify-center items-center text-center px-6 overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url('/image.png')` }}
      >
        {/* Background Animation */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-72 h-72 bg-blue-500 opacity-30 rounded-full blur-3xl animate-pulse left-10 top-10"></div>
          <div className="absolute w-96 h-96 bg-purple-500 opacity-30 rounded-full blur-3xl animate-pulse right-10 bottom-10"></div>
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold mb-4 relative z-10">AI Podcast Generator</h1>
        <p className="text-lg sm:text-xl max-w-2xl relative z-10">
          Use AI to generate podcast episodes effortlessly. Create engaging content in seconds!
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center w-full max-w-lg relative z-10">
          <input 
            type="text" 
            placeholder="Describe the podcast you want to create" 
            className="w-full p-3 rounded-lg text-black" 
          />
          <button className="bg-purple-600 hover:bg-purple-800 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition">
            Generate
          </button>
        </div>
      </section>
    );
  }