const Like = require('../models/like');
const Comment = require('../models/comment');
const Post = require('../models/post');

module.exports.toggleLike = async function (req,res) {
    try{
        // likes/toggle/?id=abcd&type=Post
        let likeable;
        let deleted = false;

        if(req.query.type=='Post'){
            likeable = await Post.findById(req.query.id).populate('likes');
        }
        else{
            likeable = await Comment.findById(req.query.id).populate('likes');
        }

        //check likes exist
        let existingLike = await Like.findOne({
            likeable: req.query.id,
            onModel: req.query.type,
            user: req.user._id
        });

        //if like exist delete it
        if(existingLike){
            likeable.likes.pull(existingLike._id);
            likeable.save();

            await existingLike.deleteOne();
            deleted = true;
        }
        else{
            //create new like
            let newLike = await Like.create({
                user: req.user._id,
                likeable: req.query.id,
                onModel: req.query.type
            });

            likeable.likes.push(newLike._id);
            likeable.save();
        }
        return res.status(200).json({
            message: 'Reuest successful',
            data: {
                deleted: deleted
            }
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            message: 'Internal Server Error'
        });
    }
}