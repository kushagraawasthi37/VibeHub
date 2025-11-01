import Share from "../models/share.js";

export const shareCount = async (req, res) => {
  try {
    const { postid } = req.params;
    const shareCount = await Share.countDocuments({
      post: postid,
    });

    return res.status(200).json({ message: "Share count fetched", shareCount });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong.try again later" });
  }
};

export const share = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { postid } = req.params;

    console.log(postid);
    const share = await Share.create({
      user: userId,
      post: postid,
    });

    return res.status(201).json({ message: "Share Done" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong.Try again later" });
  }
};
