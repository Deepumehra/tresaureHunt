import Profile from '../models/profileModel';

const Hunt = require('../models/huntSchema');  // Import Hunt model
const Clue = require('../models/clueSchema')// Import Clue model
const Profile = require('../models/profileModel');

exports.createHunt = async (req, res) => {
    try {
        const { title, description, clues } = req.body;
        
        const previousClueId = null;  // To store the next clue reference

        // Reverse loop through clues to set up the linked list structure
        const clueIds = await Promise.all(clues.reverse().map(async (clueData) => {
            if(previousClueId==null){
                clueData.isDestinationReached=true;
            }
            const clue = new Clue({
                ...clueData,
                nextClueId: previousClueId  // Link to the previous clue
            });

            const savedClue = await clue.save();  // Save clue to the database
            previousClueId = savedClue._id;  // Update previous clue reference to current

            return savedClue._id;  // Collect the clue ID
        }));
        const startClue=clueIds[0];
        const newHunt = new Hunt({
            title,
            description,
            startClueId:startClue
        });

        const savedHunt = await newHunt.save();
        res.status(201).json({ success: true, data: savedHunt });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};


exports.getAllHuntsById = async (req, res) => {
    try {
        const { profileId } = req.body;

        // Fetch the profile and populate hunt details for active and completed hunts
        const profile = await Profile.findById(profileId)
            .populate({
                path: 'activeHunts.huntId',
                model: 'Hunt'
            })
            .populate({
                path: 'completedHunts.huntId',
                model: 'Hunt'
            });

        if (!profile) {
            return res.status(404).json({ success: false, message: "Profile not found" });
        }

        // Process active hunts with detailed information
        const activeHuntDetails = profile.activeHunts.map(activeHunt => ({
            huntId: activeHunt.huntId._id,
            huntName: activeHunt.huntId.name,  // Assuming the Hunt model has a 'name' field
            startClueId: activeHunt.startClueId,
            currentClueId: activeHunt.currentClueId,
            startDate: activeHunt.startDate,
            solvedClues: activeHunt.solvedClues.map(clue => ({
                clueId: clue.clueId,
                dateSolved: clue.dateSolved
            }))
        }));

        // Process completed hunts with detailed information
        const completedHuntDetails = profile.completedHunts.map(completedHunt => ({
            huntId: completedHunt.huntId._id,
            huntName: completedHunt.huntId.name, // Assuming the Hunt model has a 'name' field
            completionDate: completedHunt.completionDate,
            solvedClues: completedHunt.solvedClues.map(clue => ({
                clueId: clue.clueId,
                dateSolved: clue.dateSolved
            }))
        }));

        // Send response with separate sections for active and completed hunts
        res.status(200).json({
            success: true,
            data: {
                profileId: profile._id,
                userName: profile.userName,
                activeHunts: activeHuntDetails,
                completedHunts: completedHuntDetails
            }
        });
    } catch (error) {
        console.error("Error retrieving hunts:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};


// Get a single Hunt by ID
exports.fetchHuntById = async (req, res) => {
    try {
        const hunt = await Hunt.findById(req.params.id).populate('clues');
        if (!hunt) {
            return res.status(404).json({ success: false, message: 'Hunt not found' });
        }
        res.status(200).json({ success: true, data: hunt });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const joinHunt=async(req,res)=>{
    try{
        const {profileId,huntId,startClueId}=req.body;
        const profile=await Profile.findOne(profileId);
        const activeHunt = profile.activeHunts.find(hunt => hunt.huntId.toString() === huntId);

        if (activeHunt) {
            return res.status(404).json({ message: "User already Participating" });
        }
        profile.activeHunts.push({
            huntId:huntId,
            startClueId:startClueId,
            currentClueId:startClueId,
            startDate:new Date(),
            solvedClues:[]
        })
        await profile.save();
        res.status(200).json({
            message:"User successfully joined the hunt",
            profile,
        })
    }catch(error){
        res.status(500).json({ success: false, error: error.message });
    }
}

exports.solveClue = async (req, res) => {
    try {
        const { profileId, huntId, currentClueId, nextClueId } = req.body;
        const profile = await Profile.findById(profileId);

        // Find the active hunt with the given huntId
        const activeHunt = profile.activeHunts.find(hunt => hunt.huntId.toString() === huntId);

        if (!activeHunt) {
            return res.status(404).json({ message: "Active hunt not found" });
        }

        // Check if currentClueId is the correct one
        if (activeHunt.currentClueIds.toString() !== currentClueId) {
            return res.status(400).json({ message: "Current clue does not match" });
        }

        // Mark currentClueId as solved
        activeHunt.solvedClues.push({
            clueId: currentClueId,
            dateSolved: new Date()
        });

        // Check if there's a next clue or if this hunt is completed
        if (nextClueId) {
            // Update currentClueIds to the next clue
            activeHunt.currentClueIds = nextClueId;
        } else {
            // If no next clue, move the hunt to completedHunts
            profile.completedHunts.push({
                huntId: activeHunt.huntId,
                completionDate: new Date(),
                solvedClues: [...activeHunt.solvedClues]
            });

            // Remove the hunt from activeHunts
            profile.activeHunts = profile.activeHunts.filter(hunt => hunt.huntId.toString() !== huntId);
        }

        // Save the updated profile
        await profile.save();

        return res.status(200).json({ message: "Clue solved successfully", profile });
    } catch (error) {
        console.error("Error solving clue:", error);
        return res.status(500).json({ message: "Server error", error });
    }
};


export const fetchClueById=async(req,res)=>{
    try{
        const {clueId}=req.body;
        if(!clueId){
            return res.status(400).json({
                message:"Clue Id not found"
            })
        }
        const clueData=await Clue.findById(clueId);
        if(!clueData){
            return res.status(400).json({
                message:"Invalid clue Id"
            })       
        }
        res.status(200).json({
            message:"Clue Details fetched successfully",
            clueDetails
        })
    }catch(error){
        return res.status(500).json({
            message:error.message,
        })
    }
}
exports.getClueById=async(req,res)=>{
    try{
        const clue=await Clue.findById(req.params.id);
        const nextClueId=clue.nextClueId;
        if(!nextClueId){
            res.status(200).json({
                message:"Treasure is here"
            })
        }
        const nextClue=await Clue.findById(nexrClueId);
        res.status(200).json({
            message:"Clue with id found",
            nextClue,
        })
    }catch(err){
        res.status(500).json({
            message: err.message,
        });
    }
}