import React, { useContext, useDebugValue, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../contexts/axiosInstance";
import { useNavigate } from "react-router-dom";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { MessageCircle, Send, Bookmark } from "lucide-react";
import { userDataContext } from "../contexts/UserContext";
import profile from "../assets/avatar.png";
import CommentsSection from "../Pages/postPages/CommentSection";

const ReelVIdeo = ({ item }) => {
  const navigate = useNavigate();
  const { userData, getCurrentUser } = useContext(userDataContext);
  const id = item._id;
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [totalLike, setTotalLike] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [totalComment, setTotalComment] = useState(0);
  const [totalSaved, setTotalSaved] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [totalShare, setTotalShare] = useState(0);
  const [isFollow, setIsFollow] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        await getCurrentUser();

        const [
          likeResponse,
          commentResponse,
          shareResponse,
          saveCountResponse,
        ] = await Promise.all([
          axiosInstance.get(`/api/posts/alllike/${id}`, {
            withCredentials: true,
          }),
          axiosInstance.get(`/api/comment/allcomment/${id}`, {
            withCredentials: true,
          }),
          axiosInstance.get(`/api/posts/sharecount/${id}`, {
            withCredentials: true,
          }),
          axiosInstance.get(`/api/posts/savecount/${id}`, {
            withCredentials: true,
          }),
        ]);

        setTotalLike(likeResponse.data?.likes?.length ?? 0);
        setTotalComment(commentResponse.data?.total ?? 0);
        setTotalShare(shareResponse.data?.shareCount ?? 0);
        setTotalSaved(saveCountResponse.data?.totalSaves ?? 0);
      } catch (error) {
        console.error("Error fetching post data:", error);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [userIsfollowsResponse, userLikeResponse, userSaveResponse] =
          await Promise.all([
            await axiosInstance.get(`/api/users/isfollower/${item.user._id}`, {
              withCredentials: true,
            }),
            axiosInstance.get(`/api/posts/like/user/${id}`, {
              withCredentials: true,
            }),
            axiosInstance.get(`/api/posts/save/user/${id}`, {
              withCredentials: true,
            }),
          ]);

        setIsFollow(userIsfollowsResponse.data.isFollows);
        setIsLiked(!!userLikeResponse.data.isLiked);
        setIsSaved(!!userSaveResponse.data.isSaved);
      } catch (error) {
        console.log(error.message);
      }
    };

    fetch();
  }, [userData]);

  const LikeHandler = async () => {
    if (!userData) return toast.error("Login to like");

    setIsLiked((prev) => {
      setTotalLike((count) => (prev ? count - 1 : count + 1));
      return !prev;
    });

    try {
      await axiosInstance.get(`/api/posts/like/${id}`, {
        withCredentials: true,
      });
    } catch (error) {
      setIsLiked((prev) => {
        setTotalLike((count) => (prev ? count + 1 : count - 1));
        return !prev;
      });
    }
  };

  const SavedHandler = async () => {
    if (!userData) return toast.error("Login to save");

    setIsSaved((prev) => {
      setTotalSaved((count) => (prev ? count - 1 : count + 1));
      return !prev;
    });

    try {
      await axiosInstance.get(`/api/posts/save/${id}`, {
        withCredentials: true,
      });
    } catch (error) {
      setIsSaved((prev) => {
        setTotalSaved((count) => (prev ? count + 1 : count - 1));
        return !prev;
      });
    }
  };

  const shareHandler = async () => {
    if (!userData) return toast.error("Login for share");
    setTotalShare((prev) => prev + 1);
    try {
      await axiosInstance.get(`/api/posts/share/${id}`, {
        withCredentials: true,
      });
    } catch (error) {
      setTotalShare((prev) => (prev > 0 ? prev - 1 : 0));
    }
  };

  const CommentHandler = () => navigate(`/comment/${item.user._id}`);

  const followHandler = async () => {
    try {
      if (!userData) {
        return toast.error("Login for follow");
      }
      setIsFollow((prev) => !prev);
      const response = await axiosInstance.get(
        `/api/users/follow/${item?.user?._id}`
      );

      console.log(response);
      setIsFollow((prev) => !prev);
    } catch (error) {
      console.log(error);
      setIsFollow((prev) => !prev);
    }
  };
  return (
    <div
      key={item._id}
      className="relative w-full h-[calc(100vh-4.5rem)] sm:h-screen snap-start flex items-center justify-center"
      style={{ scrollSnapAlign: "start" }}
    >
      {/* Video */}
      <video
        src={item.videoContent}
        className="h-full w-full object-cover"
        loop
        muted
        autoPlay
      ></video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* User info */}
      <div className="absolute hover:cursor-pointer bottom-24 left-5 text-white w-[70%]">
        <div className="flex items-center gap-3 mb-2">
          <img
            onClick={() => navigate(`/profile/${item?.user?._id}`)}
            src={item.user?.avatar || profile}
            alt="avatar"
            className="w-10 h-10 rounded-full border border-purple-500"
          />
          <span
            onClick={() => navigate(`/profile/${item?.user?._id}`)}
            className="font-semibold text-lg"
          >
            {item.user?.username}
          </span>
          {!isFollow && (
            <button
              onClick={followHandler}
              className="ml-3 bg-purple-600 hover:bg-purple-700 transition text-white text-xs px-3 py-1 rounded-full"
            >
              Follow
            </button>
          )}
        </div>
        <p className="text-sm text-gray-300">{item?.caption}</p>
      </div>

      {/* Action Buttons */}
      <div className="absolute right-5 bottom-58 flex flex-col items-center gap-6">
        {/* Like */}
        <div className="flex flex-col items-center group">
          {isLiked ? (
            <AiFillHeart
              onClick={LikeHandler}
              className="w-7 h-7 text-red-500 cursor-pointer transition"
            />
          ) : (
            <AiOutlineHeart
              onClick={LikeHandler}
              className="w-7 h-7 text-white cursor-pointer group-hover:text-pink-500 transition"
            />
          )}
          <span className="text-xs mt-1 text-gray-300">{totalLike}</span>
        </div>

        {/* Comment */}
        <div
          // onClick={CommentHandler}
          onClick={() => setIsCommentsOpen(true)}
          className="flex flex-col items-center group cursor-pointer"
        >
          <MessageCircle className="w-7 h-7 text-white group-hover:text-blue-400 transition" />
          <span className="text-xs mt-1 text-gray-300">{totalComment}</span>
          <CommentsSection
            postId={item._id}
            isOpen={isCommentsOpen}
            onClose={() => setIsCommentsOpen(false)}
          />{" "}
        </div>

        {/* Share */}
        <div
          onClick={shareHandler}
          className="flex flex-col items-center group cursor-pointer"
        >
          <Send className="w-7 h-7 text-white group-hover:text-purple-400 transition" />
          <span className="text-xs mt-1 text-gray-300">{totalShare}</span>
        </div>

        {/* Save */}
        <div className="flex flex-col items-center group">
          <Bookmark
            onClick={SavedHandler}
            className={`w-6 h-6 cursor-pointer transition ${
              isSaved
                ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]"
                : "text-gray-300 hover:text-yellow-400"
            }`}
            fill={isSaved ? "currentColor" : "none"}
          />
          <span className="text-xs text-gray-400 mt-0.5 group-hover:text-yellow-300 transition">
            {isSaved ? "Saved" : totalSaved}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReelVIdeo;
