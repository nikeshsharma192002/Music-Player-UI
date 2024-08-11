import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBackward, faCirclePlay, faCirclePause, faForward, faVolumeHigh, faVolumeMute, faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import '../SongList.css';

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function Player({ currentSong, isPlaying, onPlayPause, onNext, onPrevious, onSeek, toggleSidebar }) {
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef(null);

    useEffect(() => {
        if (currentSong) {
            if (audioRef.current) {
                audioRef.current.src = currentSong.url;
                audioRef.current.load();
                audioRef.current.onloadedmetadata = () => {
                    setDuration(audioRef.current.duration);
                };
                audioRef.current.ontimeupdate = () => {
                    setCurrentTime(audioRef.current.currentTime);
                };
            }
        }
    }, [currentSong]);

    useEffect(() => {
        if (isPlaying && audioRef.current) {
            audioRef.current.play();
        } else if (audioRef.current) {
            audioRef.current.pause();
        }
    }, [isPlaying]);

    useEffect(() => {
        const updateProgress = () => {
            if (audioRef.current) {
                setCurrentTime(audioRef.current.currentTime);
                if (audioRef.current.currentTime < duration) {
                    requestAnimationFrame(updateProgress);
                }
            }
        };

        if (isPlaying) {
            updateProgress();
        }
    }, [isPlaying, duration]);

    const handleSeekBarChange = (event) => {
        const newTime = event.target.value;
        onSeek(newTime);
        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
        }
    };

    const toggleMute = () => {
        setIsMuted((prev) => !prev);
        if (audioRef.current) {
            audioRef.current.muted = !audioRef.current.muted;
        }
    };

    return (
        <div className="player">
            {currentSong ? (
                <>
                    <div className="player-info">
                        <h1 className="player-song-name">{currentSong.name}</h1>
                        <p className="player-artist-name">{currentSong.artist}</p>
                    </div>
                    <div className="player-cover-container">
                        <img
                            src={`https://cms.samespace.com/assets/${currentSong.cover}`}
                            alt={currentSong.name}
                            className="player-cover"
                        />
                    </div>
                    <div className="play-line">
                        <input
                            type="range"
                            className="play-line-seekbar"
                            min="0"
                            max={duration}
                            value={currentTime}
                            onChange={handleSeekBarChange}
                            style={{
                                background: 'transparent',
                                cursor: 'pointer',
                            }}
                        />
                        <div
                            className="play-line-progress"
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                        />
                    </div>
                    <div className="player-controls">
                        <FontAwesomeIcon
                            icon={faEllipsisH}
                            onClick={toggleSidebar}
                            style={{ cursor: 'pointer' }}
                            className='player-dot-button'
                        />

                        <FontAwesomeIcon
                            icon={faBackward}
                            onClick={onPrevious}
                            style={{ cursor: 'pointer' }}
                            className='player-previous-button'
                        />
                        {isPlaying ? (
                            <FontAwesomeIcon
                                icon={faCirclePause}
                                onClick={onPlayPause}
                                style={{ cursor: 'pointer' }}
                                className='player-play-button'
                            />
                        ) : (
                            <FontAwesomeIcon
                                icon={faCirclePlay}
                                onClick={onPlayPause}
                                style={{ cursor: 'pointer' }}
                                className='player-play-button'
                            />
                        )}
                        <FontAwesomeIcon
                            icon={faForward}
                            onClick={onNext}
                            style={{ cursor: 'pointer' }}
                            className='player-next-button'
                        />
                        <FontAwesomeIcon
                            icon={isMuted ? faVolumeMute : faVolumeHigh}
                            onClick={toggleMute}
                            style={{ cursor: 'pointer' }}
                            className='player-volume-button'
                        />

                    </div>
                </>
            ) : (
                <p>No song selected.</p>
            )}
            <audio ref={audioRef} />
        </div>
    );
}

export default Player;
