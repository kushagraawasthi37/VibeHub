import Share from "../models/share.js";

export const share = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { postid } = req.params;
    if (!postid) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // console.log(postid);
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
