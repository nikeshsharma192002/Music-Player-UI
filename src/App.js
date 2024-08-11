import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import Profile from './components/Profile';
import './index.css';
import './SongList.css';

const API_URL = 'https://cms.samespace.com/items/songs';

function App() {
    const [songs, setSongs] = useState([]);
    const [currentSong, setCurrentSong] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredSongs, setFilteredSongs] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [backgroundColor, setBackgroundColor] = useState('#f4f4f4');
    const [showSidebar, setShowSidebar] = useState(true); // New state for responsive design

    useEffect(() => {
        const fetchSongs = async () => {
            try {
                const response = await axios.get(API_URL);
                setSongs(response.data.data);
                setFilteredSongs(response.data.data);
                if (response.data.data.length > 0) {
                    setCurrentSong(response.data.data[0]);
                }
            } catch (error) {
                console.error('Error fetching songs', error);
            }
        };
        fetchSongs();
    }, []);

    useEffect(() => {
        if (currentSong) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = new Audio(currentSong.url);
            } else {
                audioRef.current = new Audio(currentSong.url);
            }
            setBackgroundColor(currentSong.accent || '#f4f4f4');
            setIsPlaying(false);
        }
    }, [currentSong]);

    useEffect(() => {
        if (isPlaying) {
            audioRef.current.play();
        } else if (audioRef.current) {
            audioRef.current.pause();
        }
    }, [isPlaying]);

    useEffect(() => {
        if (searchTerm === '') {
            setFilteredSongs(songs);
        } else {
            setFilteredSongs(songs.filter(song =>
                song.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                song.artist.toLowerCase().includes(searchTerm.toLowerCase())
            ));
        }
    }, [searchTerm, songs]);

    const handleSongChange = (song) => {
        setCurrentSong(song);
        setIsPlaying(false);
    };

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const handleNext = () => {
        const currentIndex = songs.findIndex(song => song.id === currentSong.id);
        const nextIndex = (currentIndex + 1) % songs.length;
        setCurrentSong(songs[nextIndex]);
        setIsPlaying(false);
    };

    const handlePrevious = () => {
        const currentIndex = songs.findIndex(song => song.id === currentSong.id);
        const previousIndex = (currentIndex - 1 + songs.length) % songs.length;
        setCurrentSong(songs[previousIndex]);
        setIsPlaying(false);
    };

    const handleTimeUpdate = () => {
        setCurrentTime(audioRef.current.currentTime);
        setDuration(audioRef.current.duration);
    };

    const handleSeek = (time) => {
        audioRef.current.currentTime = time;
        setCurrentTime(time);
    };

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
        }
        return () => {
            if (audioRef.current) {
                audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
            }
        };
    }, []);

    const toggleSidebar = () => {
        setShowSidebar(!showSidebar);
    };

    return (
        <div className="app-container">
            <div className="dynamic-background" style={{ backgroundColor }}></div>
            <Profile />
            {showSidebar && (
                <Sidebar
                    songs={filteredSongs}
                    onSongChange={handleSongChange}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                />
            )}
            <Player
                currentSong={currentSong}
                isPlaying={isPlaying}
                onPlayPause={handlePlayPause}
                onNext={handleNext}
                onPrevious={handlePrevious}
                currentTime={currentTime}
                duration={duration}
                onSeek={handleSeek}
                toggleSidebar={toggleSidebar} // Pass the toggle function to the Player component
            />
        </div>
    );
}

export default App;
