// // import { useState } from "react";
// import { FormData } from "@/types";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import { useState } from "react";


// interface FormProps {
//   onSubmit: (data: FormData) => void;
// }

// export default function Form({ onSubmit }: FormProps) {
//   const [formData, setFormData] = useState<FormData>({ location: "", emotion: "" });

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     onSubmit(formData);
//   }

//   return (
//     <Card className="bg-gray-800 border-gray-700 p-6">
//       {/* <h2 className="text-xl font-semibold mb-4">Get Topic Recommendations</h2> */}
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div className="grid grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm text-gray-400 mb-1">Location</label>
//             <Input
//               type="text"
//               name="location"
//               value={formData.location}
//               onChange={handleChange}
//               className="bg-gray-700 border-gray-600"
//               placeholder="Enter location for latest trends"
//             />
//           </div>
//           <div>
//             <label className="block text-sm text-gray-400 mb-1">Emotion</label>
//             <Input
//               type="text"
//               name="emotion"
//               value={formData.emotion}
//               onChange={handleChange}
//               className="bg-gray-700 border-gray-600"
//               placeholder="Enter emotion"
//             />
//           </div>
//         </div>
//         <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
//           Generate
//         </Button>
//       </form>
//     </Card>
//   );
// }

import { useState } from "react";
import { FormData } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
    <Card className="bg-gray-800 border-gray-700 p-6">
      {/* <h2 className="text-xl font-semibold mb-4">Get Topic Recommendations</h2> */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Location</label>
            <Input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="bg-gray-700 border-gray-600"
              placeholder="Enter location for latest trends"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Emotion</label>
            <Input
              type="text"
              name="emotion"
              value={formData.emotion}
              onChange={handleChange}
              className="bg-gray-700 border-gray-600"
              placeholder="Enter emotion"
            />
          </div>
        </div>
        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
          Generate
        </Button>
      </form>
    </Card>
  );
}