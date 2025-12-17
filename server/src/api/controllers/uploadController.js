// server/src/api/controllers/uploadController.js
const supabase = require('../../config/supabase');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');

exports.uploadFile = catchAsync(async (req, res, next) => {
    const file = req.file;
    if (!file) {
        return next(new AppError('No file uploaded', 400));
    }

    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${fileExt}`;

    const { data, error } = await supabase
        .storage
        .from('chat-attachments')
        .upload(fileName, file.buffer, {
            contentType: file.mimetype
        });

    if (error) {
        throw error;
    }

    const { data: publicData } = supabase
        .storage
        .from('chat-attachments')
        .getPublicUrl(fileName);

    res.json({ 
        fileUrl: publicData.publicUrl,
        fileType: file.mimetype.startsWith('image/') ? 'image' : 'document',
        fileName: file.originalname
    });
});