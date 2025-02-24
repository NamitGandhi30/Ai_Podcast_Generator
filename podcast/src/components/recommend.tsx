import { useState } from "react";
import { FormData } from "@/types";

interface FormProps {
  onSubmit: (data: FormData) => void;
}

export default function Form({ onSubmit }: FormProps) {  
  const [formData, setFormData] = useState<FormData>({ location: "", emotion: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="bg-purple-800 text-white p-6 rounded-lg w-full max-w-lg mx-auto"
    >
      <label className="block mb-3 text-lg">
        Location:
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="w-full p-2 border rounded-md bg-purple-900 text-white placeholder-gray-300 mt-1"
          placeholder="Enter Location for latest trends"
        />
      </label>
      <label className="block mb-3 text-lg">
        Emotion:
        <input
          type="text"
          name="emotion"
          value={formData.emotion}
          onChange={handleChange}
          className="w-full p-2 border rounded-md bg-purple-900 text-white placeholder-gray-300 mt-1"
          placeholder="Enter emotion"
        />
      </label>
      <button 
        type="submit" 
        className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md w-full"
      >
        Get Recommendations
      </button>
    </form>
  );
}
