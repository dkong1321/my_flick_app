const express = require('express')
const router = express()
const asyncHandler = require('express-async-handler')
const db = require('../../db/models')


router.get('/', asyncHandler(async(req,res,next)=>{
    const albums = await db.Album.findAll({include:db.Image});
    res.json({albums})

}))

router.post('/', asyncHandler(async(req,res)=>{
    const {title, userId} = req.body;
    const newAlbum = {title, userId};
    const album = await db.Album.build(newAlbum)
    await album.save();
    res.json(album)
}))

// edit album name
router.put('/editalbum/:id', asyncHandler(async(req,res)=>{
    const albumId = req.params.id
    const {title} =req.body;
    const albumToUpdate = await db.Album.findByPk(albumId);

    await albumToUpdate.update({
        title
    });

    res.json(
        albumToUpdate
    )
}))

// add images to album (AlbumImage)
router.post(`/addimage/:id`, asyncHandler(async(req,res)=>{
    const albumId = req.params.id
    const {imageId} = req.body
    const albumImageRelation = await db.AlbumImage.build({albumId,imageId})
    const oldRelation = await db.AlbumImage.findOne({
        where:{albumId, imageId}
    })
    if(!oldRelation){
        await albumImageRelation.save();
        res.json(albumImageRelation)
    } else {
        res.json({
            message:"image is already in album"
        })

    }

}))

//remove image from album
router.delete('/removeimage/:id', asyncHandler(async(req,res)=>{
    const albumId = req.params.id;
    const {id} = req.body
    const imageId = id
    const albumImageRelation = await db.AlbumImage.findOne({where:{albumId,imageId}})
    if(albumImageRelation) {
       await albumImageRelation.destroy()
    }

    res.json({
        message:"successfully deleted album"
    })
}) )


//delete album
router.delete('/:id', asyncHandler(async(req,res)=>{
    // console.log("hello from delete album route")
    const albumId = req.params.id;
    const albumToDelete = await db.Album.findByPk(albumId)
    // console.log("albumId", albumId)
    // console.log("album object to be deleted", albumToDelete)
    const albumImageRelation = await db.AlbumImage.findAll({
        where:{
            albumId
        }
    })
    console.log("items from the join table", albumImageRelation)

    if(albumImageRelation) {
        albumImageRelation.forEach((imageAssociation)=>{
        imageAssociation.destroy()
    })
    }

    if (albumToDelete) {
        await albumToDelete.destroy();
    }

    res.json({
        message:"successfully deleted album"
    })
}))

module.exports = router;
