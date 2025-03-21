import BadgeIcon from '@mui/icons-material/Badge';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import {
    Avatar, Box, Button, Card,
    Drawer, Grid, List, ListItem, ListItemText,
    TextField, Typography
} from '@mui/material';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import A1 from '../../Components/Avatars/A1.jpeg';
import A10 from '../../Components/Avatars/A10.jpeg';
import A2 from '../../Components/Avatars/A2.jpeg';
import A3 from '../../Components/Avatars/A3.jpeg';
import A4 from '../../Components/Avatars/A4.jpeg';
import A5 from '../../Components/Avatars/A5.jpeg';
import A6 from '../../Components/Avatars/A6.jpeg';
import A7 from '../../Components/Avatars/A7.jpeg';
import A8 from '../../Components/Avatars/A8.jpeg';
import A9 from '../../Components/Avatars/A9.jpeg';
import Footer from '../../Components/Footer/Footer';
import Header from '../../Components/Header/Header';
import AvatarSelectDialog from '../../Components/ProfileAvatarDialogue/ProfileAvatarDialogue';
import { fetchProfile, saveProfile, updateProfile } from '../../State/Authentication/Action';
import './Profile.css';
const avatars = [A1, A2, A3, A4, A5, A6, A7, A8, A9, A10];

const validationSchema = Yup.object().shape({
    name: Yup.string().required('User Name is required').min(5, 'User Name must be at least 5 characters'),
    phone: Yup.string().required('Phone number is required').matches(/^\d{10}$/, 'Phone number must be a 10-digit number.'),
    bio: Yup.string().optional(),
    points: Yup.number().optional(),
    globalRank: Yup.number().optional(),
    activeHunts: Yup.array().of(Yup.string()).optional(),
    badges: Yup.array().of(Yup.string()).optional(),
    avatarIndex: Yup.number().optional(),
});

const ProfilePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { profile, error } = useSelector((state) => state.auth);

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [bio, setBio] = useState('');
    const [points, setPoints] = useState(0);
    const [globalRank, setGlobalRank] = useState(0);
    const [badges, setBadges] = useState([]);
    const [activeHunts, setActiveHunts] = useState([]);
    const [avatarIndex, setAvatarIndex] = useState(0);

    const [sidePaneOpen, setSidePaneOpen] = useState(false);
    const [openAvatarDialogue, setOpenAvatarDialogue] = useState(false);

    useEffect(() => {
        dispatch(fetchProfile());
        // console.log(profile);
    }, [dispatch]);

    useEffect(() => {
        if (profile) {
            console.log('edited')
            setName(profile.userName);
            setPhone(profile.phoneNumber);
            setBio(profile.description);
            setPoints(profile.points);
            setGlobalRank(profile.globalRank);
            setBadges(profile.badges || []);
            setActiveHunts(profile.activeHunts);
            setAvatarIndex(profile.avatarIndex);
        } else if (error) {
            console.error("Error fetching profile:", error);
        }
        
    }, [profile, error]);

    const formik = useFormik({
        initialValues: {
            name,
            phone,
            bio,
            points,
            globalRank,
            badges,
            activeHunts,
            avatarIndex,
        },
        validationSchema,
        onSubmit: (values) => {
            if(profile === null) {
                dispatch(saveProfile(values));
                console.log('profile saved');
            } else {
                console.log(values);
                dispatch(updateProfile(values));
                console.log('profile updated');
            }
        },
        enableReinitialize: true,
    });

    const handleSelectAvatar = (index) => {
        setAvatarIndex(index);
        formik.setFieldValue('avatarIndex', avatarIndex);
        setOpenAvatarDialogue(false);
    };
    const {auth}=useSelector((store)=>store)
    // console.log("Auth :",auth);
    return (
        <div className='profile-div'>
            <Header />
            <Box sx={{m: 5, backgroundColor: '#fff'}} >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={2}>
                        <Avatar
                            onClick={() => { setOpenAvatarDialogue(true); }}
                            src={avatars[avatarIndex-1]}
                            sx={{ width: 80, height: 80 }}
                        />
                        <Box>
                            <Typography variant="h6">{name || "Your Name"}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Rank: {globalRank} | Points: {points}
                            </Typography>
                        </Box>
                    </Box>
                    <Button sx={{fontSize: 10}} onClick={() => setSidePaneOpen(true)}>View Hunts & Achievements</Button>
                </Box>

                <AvatarSelectDialog open={openAvatarDialogue} onClose={() => setOpenAvatarDialogue(false)} onSelect={handleSelectAvatar} />

                <Box sx={{ mt: 2 }}>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="About Me"
                        name="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us a little about yourself..."
                    />
                </Box>

                <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="User Name"
                            name="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            error={formik.touched.name && Boolean(formik.errors.name)}
                            helperText={formik.touched.name && formik.errors.name}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="Phone Number"
                            name="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            error={formik.touched.phone && Boolean(formik.errors.phone)}
                            helperText={formik.touched.phone && formik.errors.phone}
                        />
                    </Grid>
                </Grid>

                <Box display="flex" gap={2} sx={{ mt: 3 }}>
                    <Card sx={{ flex: 1, p: 2, textAlign: 'center' }}>
                        <LeaderboardIcon color="primary" />
                        <Typography variant="h6">Total Hunts</Typography>
                        <Typography variant="h4">{activeHunts.length}</Typography>
                    </Card>
                    <Card sx={{ flex: 1, p: 2, textAlign: 'center' }}>
                        <BadgeIcon color="secondary" />
                        <Typography variant="h6">Badges</Typography>
                        <Typography variant="h4">{badges.length}</Typography>
                    </Card>
                </Box>

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={formik.handleSubmit}
                        disabled={!formik.isValid}
                    >
                        Save Profile
                    </Button>
                </Box>

                <Drawer anchor="right" open={sidePaneOpen} onClose={() => setSidePaneOpen(false)}>
                    <Box width={250} p={2}>
                        <Typography variant="h6">Active Hunts</Typography>
                        <List>
                            {activeHunts.map((hunt, index) => (
                                <ListItem key={index}>
                                    <ListItemText primary={hunt} />
                                </ListItem>
                            ))}
                        </List>
                        <Typography variant="h6" sx={{ mt: 2 }}>Achievements</Typography>
                        <List>
                            {badges.map((badge, index) => (
                                <ListItem key={index}>
                                    <BadgeIcon sx={{ color: '#ff9800', fontSize: 20, mr: 1 }} />
                                    <ListItemText primary={badge} />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                </Drawer>
            </Box>
            <Footer/>
        </div>
    );
};

export default ProfilePage;
