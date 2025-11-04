import React, { useContext, useEffect, useState } from "react";
import { Settings, Grid, PlaySquare, ArrowLeft } from "lucide-react";
import profile from "../../assets/avatar.png";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../contexts/axiosInstance";
import { userDataContext } from "../../contexts/UserContext";
import { linkWithCredential } from "firebase/auth";
import Loader from "../../components/Loader";
import BottomNavbar from "../../components/BottomNavbar";
import LeftNavbar from "../../components/LeftNavbar";
import SettingsMenu from "../../components/SettingsMenu";
import { toast } from "react-toastify";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [followers, setFollowers] = useState(0);
  const [isFollowed, setIsFollowed] = useState(false);
  //   const [isRequested, setIsFollowed] = useState(false);
  const [following, setFollowing] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [allContent, setAllContent] = useState([]);
  const [videoContent, setVideoContent] = useState([]);
  const [user, setUser] = useState({});
  const [isOwner, setIsOwner] = useState(false);
  const { getCurrentUser, userData } = useContext(userDataContext);

  //   console.log(allContent[0]);
  // console.log(videoContent[0]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!id) return;

        const [
          followerResponse,
          followingResponse,
          allContentResponse,
          videoContentResponse,
          userResponse,
        ] = await Promise.all([
          axiosInstance.get(`/api/users/follower/${id}`, {
            withCredentials: true,
          }),
          axiosInstance.get(`/api/users/following/${id}`, {
            withCredentials: true,
          }),
          axiosInstance.get(`/api/users/userpost/${id}`, {
            withCredentials: true,
          }),
          axiosInstance.get(`/api/users/uservideopost/${id}`, {
            withCredentials: true,
          }),
          axiosInstance.get(`/api/users/profileadmin/${id}`, {
            withCredentials: true,
          }),
        ]);

        console.log(followerResponse.data);
        setFollowers(followerResponse.data.followerCount);
        setFollowing(followingResponse.data.followingCount);
        setAllContent(allContentResponse.data.posts);
        setVideoContent(videoContentResponse.data.posts);
        setTotalPosts(allContentResponse.data.posts.length);
        setUser(userResponse.data.user);
      } catch (error) {
        console.log("Error in fetching data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const checkFollower = async () => {
    try {
      setLoading(true);
      if (!id) return;
      getCurrentUser();
      const response = await axiosInstance.get(`/api/users/isfollower/${id}`);

      setIsFollowed(response.data.isFollows);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const checkOwner = async () => {
    try {
      if (!id) return;
      getCurrentUser();
      const response = await axiosInstance.get(`/api/users/owner/${id}`);
      setIsOwner(response.data);
      // console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const followHandler = async () => {
    try {
      if (!userData) {
        return toast.error("Login for Follow");
      }
      setFollowers((prev) => (isFollowed ? prev - 1 : prev + 1));
      setIsFollowed((prev) => !prev);
      const response = await axiosInstance.get(`/api/users/follow/${id}`);
      console.log(response.data.message);
    } catch (error) {
      console.log(error);
      setIsFollowed((prev) => !prev);
    }
  };

  useEffect(() => {
    const fetch = async () => {
      await checkFollower();
      await checkOwner();
    };

    fetch();
  }, []);

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="min-h-screen bg-black text-white flex flex-col items-center pb-20 font-sans overflow-x-hidden">
            <BottomNavbar />
            {/* Header */}
            <div className="w-full max-w-2xl flex items-center justify-between px-5 py-3 border-b border-neutral-800 sticky top-0 bg-black/60 backdrop-blur-md z-50 shadow-[0_0_15px_rgba(168,85,247,0.15)] animate-fadeDown">
              {/* Back Button + Username */}
              <div className="flex items-center gap-3">
                <ArrowLeft
                  onClick={() => navigate("/")}
                  className="w-6 h-6 text-gray-300 hover:text-purple-400 transition-transform duration-300  cursor-pointer"
                />
                <h2 className="font-semibold text-lg tracking-wide">
                  {user.username}
                </h2>
              </div>
              {/* Settings Button */}
              <SettingsMenu />{" "}
            </div>

            {/* Profile Info Section */}
            <div className="w-full max-w-2xl px-4 mt-5 animate-fadeIn">
              <div className="flex items-center justify-between">
                {/* Avatar */}
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-purple-500 blur-md opacity-30 animate-pulse"></div>
                  <img
                    src={user.avatar || profile}
                    alt="avatar"
                    className="relative w-24 h-24 rounded-full border-2 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                  />
                </div>

                {/* Stats */}
                <div className="flex flex-1 justify-around ml-6 text-center">
                  {[
                    { label: "Posts", value: totalPosts },
                    { label: "Followers", value: followers },
                    { label: "Following", value: following },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="transition-transform duration-300 hover:scale-105"
                    >
                      <p className="font-semibold text-lg text-white">
                        {item.value}
                      </p>
                      <p className="text-gray-400 text-sm tracking-wide">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Name + Bio */}
              <div className="mt-4 text-left">
                <h3 className="font-semibold text-base">{user.name}</h3>
                <p className="text-gray-300 text-sm mt-1 max-w-md leading-snug">
                  {user?.bio || ""}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-5">
                {isOwner ? (
                  <>
                    {" "}
                    <button
                      onClick={() => navigate(`/profile/editprofile/${id}`)}
                      className="flex-1 py-1.5 rounded-lg bg-gradient-to-r from-purple-700/50 to-purple-500/30 border border-purple-600/40 text-sm font-medium text-purple-200 hover:from-purple-600/70 hover:to-purple-400/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all duration-300"
                    >
                      Edit Profile
                    </button>
                    <button className=" flex-1 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-sm font-medium hover:shadow-[0_0_10px_rgba(255,255,255,0.15)] transition-all duration-300">
                      Share profile
                    </button>{" "}
                  </>
                ) : (
                  <>
                    {user.privateAccount ? (
                      <button className="flex-1 py-1.5 rounded-lg bg-gradient-to-r from-purple-700/50 to-purple-500/30 border border-purple-600/40 text-sm font-medium text-purple-200 hover:from-purple-600/70 hover:to-purple-400/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all duration-300"></button>
                    ) : (
                      <>
                        <button
                          onClick={followHandler}
                          className="flex-1 py-1.5 rounded-lg bg-gradient-to-r from-purple-700/50 to-purple-500/30 border border-purple-600/40 text-sm font-medium text-purple-200 hover:from-purple-600/70 hover:to-purple-400/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all duration-300 hover:cursor-pointer"
                        >
                          {isFollowed ? "Following" : "Follow"}
                        </button>
                        <button
                          disabled
                          className=" flex-1 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-sm font-medium hover:shadow-[0_0_10px_rgba(255,255,255,0.15)] transition-all duration-300"
                        >
                          Message
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Tabs (Posts | Reels) */}
            <div className="flex justify-around w-full max-w-2xl mt-8 border-t border-neutral-800 pt-3">
              <button
                onClick={() => setActiveTab("posts")}
                className={`flex items-center justify-center flex-1 py-2 transition-all duration-300 ${
                  activeTab === "posts"
                    ? "text-purple-400 border-t-2 border-purple-500"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <Grid size={22} />
              </button>

              <button
                onClick={() => setActiveTab("reels")}
                className={`flex items-center justify-center flex-1 py-2 transition-all duration-300 ${
                  activeTab === "reels"
                    ? "text-purple-400 border-t-2 border-purple-500"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <PlaySquare size={22} />
              </button>
            </div>

            <div className="max-w-2xl w-full px-1 mt-3 animate-fadeIn">
              {activeTab === "posts" ? (
                allContent.length > 0 ? (
                  <div className="grid grid-cols-3 gap-[2px]">
                    {allContent.map((post, i) => (
                      <div
                        key={i}
                        onClick={() => navigate(`/post/${post._id}`)}
                        className={`aspect-square overflow-hidden relative group cursor-pointer ${
                          !post.imageContent &&
                          !post.videoContent &&
                          post.content
                            ? "flex items-center justify-center"
                            : ""
                        }`}
                      >
                        {/* Media: Image or Video */}
                        {post.imageContent ? (
                          <img
                            src={post.imageContent}
                            alt={`post-img-${i}`}
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-all duration-500"
                          />
                        ) : post.videoContent ? (
                          <video
                            src={post.videoContent}
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-all duration-500"
                            muted
                            loop
                            autoPlay
                          />
                        ) : null}

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all duration-500" />

                        {/* Text-only post */}
                        {post.content &&
                          !post.imageContent &&
                          !post.videoContent && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-700/40 via-neutral-900 to-purple-950/50 border border-purple-800/30 shadow-[0_0_25px_rgba(168,85,247,0.25)] hover:shadow-[0_0_40px_rgba(168,85,247,0.4)] rounded-sm p-3 transition-all duration-500">
                              <p className="text-purple-200 text-sm sm:text-base font-medium text-center leading-snug animate-fadeIn">
                                {post.content}
                              </p>
                              <div className="absolute inset-0 bg-purple-500/10 blur-lg opacity-40 group-hover:opacity-70 transition-all duration-500"></div>
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                ) : (
                  // 🟣 Empty state for NO POSTS
                  <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400 animate-fadeIn">
                    {isOwner ? (
                      <>
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600/40 to-purple-800/30 border border-purple-600/40 flex items-center justify-center shadow-[0_0_25px_rgba(168,85,247,0.3)] mb-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-10 h-10 text-purple-400"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 4.5v15m7.5-7.5h-15"
                            />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-white">
                          Create your first post
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          Share your point of view with the world 🌍
                        </p>
                        <button
                          onClick={() => navigate("/createpost")}
                          className="mt-5 px-5 py-2 rounded-lg bg-gradient-to-r from-purple-700/50 to-purple-500/30 border border-purple-600/40 text-sm font-medium text-purple-200 hover:from-purple-600/70 hover:to-purple-400/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-300"
                        >
                          Create
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-neutral-800 to-purple-900/20 border border-neutral-700 flex items-center justify-center shadow-[0_0_25px_rgba(255,255,255,0.1)] mb-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-10 h-10 text-gray-500"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4.5 8.25h15m-15 7.5h15"
                            />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-white">
                          No Posts Yet
                        </h3>
                      </>
                    )}
                  </div>
                )
              ) : videoContent.length > 0 ? (
                <div className="grid grid-cols-3 gap-[2px]">
                  {videoContent.map((reel, i) => (
                    <div
                      onClick={() => navigate(`/post/${reel._id}`)}
                      key={i}
                      className="aspect-square overflow-hidden relative group cursor-pointer"
                    >
                      <video
                        src={reel.videoContent}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-all duration-500"
                        muted
                        loop
                        autoPlay
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                    </div>
                  ))}
                </div>
              ) : (
                // 🟣 Empty state for NO REELS
                <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400 animate-fadeIn">
                  {isOwner ? (
                    <>
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600/40 to-purple-800/30 border border-purple-600/40 flex items-center justify-center shadow-[0_0_25px_rgba(168,85,247,0.3)] mb-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-10 h-10 text-purple-400"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 4.5v15m7.5-7.5h-15"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-white">
                        Create your first reel
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">
                        Capture your moments and share your vibe 🎥
                      </p>
                      <button
                        onClick={() => navigate("/createpost")}
                        className="mt-5 px-5 py-2 rounded-lg bg-gradient-to-r from-purple-700/50 to-purple-500/30 border border-purple-600/40 text-sm font-medium text-purple-200 hover:from-purple-600/70 hover:to-purple-400/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-300"
                      >
                        Create
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-neutral-800 to-purple-900/20 border border-neutral-700 flex items-center justify-center shadow-[0_0_25px_rgba(255,255,255,0.1)] mb-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-10 h-10 text-gray-500"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 8.25h15m-15 7.5h15"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-white">
                        No Reels Yet
                      </h3>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
