import React, { useState } from "react";
import { Camera, ArrowLeft } from "lucide-react";
import axios from "../../contexts/axiosInstance.js";
import { toast } from "react-toastify";
import profile from "../../assets/avatar.png";
import { useContext } from "react";
import { userDataContext } from "../../contexts/UserContext";

import { useNavigate, useParams } from "react-router-dom";

const EditProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userData } = useContext(userDataContext);
  const [avatar, setAvatar] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [preview, setPreview] = useState(null);

  const handleAvatarChange = (e) => {
    console.log(e);
    const file = e.target.files[0];

    if (file) {
      setPreview(URL.createObjectURL(file));
      setAvatar(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!id) return;
      const formData = new FormData();
      formData.append("name", name);
      formData.append("bio", bio);
      formData.append("avatar", avatar);

      //   console.log("name :", name);
      //   console.log("name :", bio);
      //   console.log("avatar :", avatar);
      const response = await axios.post(
        `/api/users/profile/update-details/${id}`,
        formData,
        {
          withCredentials: true,
        }
      );

      setBio("");
      setName("");
      //   console.log(response.data);
      toast.success(response.data.message);
    } catch (error) {
      console.log(error.message);
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        "Something went wrong";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center px-5 py-6">
      {/* Header */}
      <div className="w-full max-w-2xl flex items-center justify-between px-2 py-3 border-b border-neutral-800 sticky top-0 bg-black/60 backdrop-blur-md z-50 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-neutral-900 rounded-full transition">
            <ArrowLeft
              onClick={() => navigate(`/profile/${id}`)}
              className="text-gray-300"
            />
          </button>
          <h2 className="font-semibold text-lg tracking-wide">Edit Profile</h2>
        </div>
      </div>

      {/* Form Section */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center mt-8 w-full max-w-md space-y-6"
      >
        {/* Avatar Upload */}
        <div className="relative group">
          <img
            src={preview || userData?.avatar || profile}
            alt="avatar"
            className="w-32 h-32 rounded-full border-2 border-neutral-700 shadow-lg shadow-purple-500/20 object-cover"
          />
          <label
            htmlFor="avatar"
            className="absolute bottom-2 right-2 bg-purple-600 hover:bg-purple-700 p-2 rounded-full cursor-pointer transition transform group-hover:scale-110"
          >
            <Camera size={18} />
            <input
              id="avatar"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Name */}
        <div className="w-full">
          <label className="text-sm text-gray-400 mb-1 block">Name</label>
          <input
            type="text"
            value={name}
            placeholder="Enter your name"
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
          />
        </div>

        {/* Bio */}
        <div className="w-full">
          <label className="text-sm text-gray-400 mb-1 block">Bio</label>
          <textarea
            value={bio}
            placeholder="Write something about yourself..."
            onChange={(e) => setBio(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition resize-none"
            rows="4"
          />
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-all duration-300 font-semibold shadow-[0_0_10px_rgba(168,85,247,0.4)]"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
