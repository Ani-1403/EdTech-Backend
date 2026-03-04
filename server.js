const express = require('express');
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const app = express();
const prisma = new PrismaClient();
app.use(express.json());

const authenticateUser = (req, res, next) => {
    req.user = { id: 1 }; 
    next();
};

app.post('/api/enroll', authenticateUser, async (req, res) => {
    const { courseId } = req.body;
    const userId = req.user.id;

    try {
        const enrollment = await prisma.enrollment.create({
            data: {
                userId: userId,
                courseId: courseId,
            }
        });
        res.status(201).json({ message: "Successfully enrolled!", enrollment });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: "Already enrolled in this course." });
        }
        res.status(500).json({ error: "Internal server error." });
    }
});

app.get('/api/videos/:videoId/stream', authenticateUser, async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user.id;

    try {
        const video = await prisma.video.findUnique({
            where: { id: parseInt(videoId) },
            include: { course: { include: { enrollments: { where: { userId } } } } }
        });

        if (!video || video.course.enrollments.length === 0) {
            return res.status(403).json({ error: "Not enrolled in this course." });
        }
        const securityKey = process.env.BUNNY_SECURITY_KEY || "dummy_test_key";
        const expirationTime = Math.floor(Date.now() / 1000) + 3600; 
        
        const hashData = `${securityKey}${video.videoUrl}${expirationTime}`;
        const token = crypto.createHash('sha256').update(hashData).digest('hex');

        const streamUrl = `https://video.bunnycdn.com/play/${video.videoUrl}?token=${token}&expires=${expirationTime}`;

        res.json({ streamUrl });
    } catch (error) {
        res.status(500).json({ error: "Failed to generate stream URL." });
    }
});


app.post('/api/progress', authenticateUser, async (req, res) => {
    const { videoId, watchedSecs } = req.body;
    const userId = req.user.id;

    try {
        const video = await prisma.video.findUnique({ where: { id: parseInt(videoId) } });
        
        if (!video) {
            return res.status(404).json({ error: "Video not found" });
        }

        
        const isCompleted = watchedSecs >= (video.duration * 0.9);

        
        const progress = await prisma.progress.upsert({
            where: {
                userId_videoId: { userId, videoId: parseInt(videoId) }
            },
            update: {
                watchedSecs,
                isCompleted
            },
            create: {
                userId,
                videoId: parseInt(videoId),
                watchedSecs,
                isCompleted
            }
        });

        res.json({ message: "Progress updated", progress });
    } catch (error) {
        res.status(500).json({ error: "Failed to update progress" });
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`EdTech Backend running on port ${PORT}`));