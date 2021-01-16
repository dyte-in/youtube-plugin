import React, {
    useRef, useEffect, useState, useCallback,
} from 'react';
import { DytePlugin, Events } from 'dyte-plugin-sdk';
import {
    Navbar,
    FormControl,
    Container,
    Row,
    Col,
    NavItem,
} from 'react-bootstrap';

import YouTube from 'react-youtube';

import logo from './assets/youtube_icon.png';
import reloadIcon from './assets/reload.png';
import { time } from 'console';

declare global {
    interface Window { }
}

const YOUTUBE_URL_REGEX = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;

// const autoplay: 0 | 1 | undefined = 1;

const videoOptions = {
    height: '100%',
    width: '100%',
    // playerVars: {
    //     autoplay,
    // },
};

function validateYouTubeURL(share: string): string | null {
    const match = share.match(YOUTUBE_URL_REGEX);
    return (match && match[7].length === 11) ? match[7] : null;
}

interface YouTubeEvent {
    target: any;
    data?: number;
}

interface YouTubeEventData {
    data: {
        action: 'play' | 'pause';
    };
    id: string;
    uuid: string;
    scope: string;
}

interface YouTubeStoredData {
    shareUrl: string;
    currentTime: number;
    lastUpdated: number;
}

export default function MainView() {
    const [videoId, setVideoId] = useState<string>('');
    const [share, setShare] = useState<string>('');
    const [inputBar, setInputBar] = useState<string>('');
    const [plugin, setPlugin] = useState<DytePlugin>();

    const dataStore = useRef<YouTubeStoredData>({
        shareUrl: share,
        currentTime: 0,
        lastUpdated: +new Date(),
    });

    const isPlaying = useRef<boolean>(false);
    const videoElement = useRef<any>({ target: null });

    const initPlugin = useCallback(async () => {
        const dytePlugin = new DytePlugin();
        await dytePlugin.init();
        dytePlugin.connection.on(Events.pluginData, (payload: { data: YouTubeStoredData }) => {
            setDocumentView(payload.data.shareUrl);
            dataStore.current = payload.data;
        });

        dytePlugin.connection.on(Events.pluginEvent, (payload: YouTubeEventData) => {
            if (!videoElement.current) {
                console.log('videoElement.current is not defined!');
                return;
            }

            const timeDelta = (+new Date() - dataStore.current.lastUpdated) / 1000;
            console.log('timeDelta', timeDelta);

            switch (payload.data.action) {
            case 'play':
                if (isPlaying.current) break;
                console.log('play!');
                videoElement.current.seekTo(dataStore.current.currentTime + timeDelta);
                videoElement.current.playVideo();
                break;
            case 'pause':
                if (!isPlaying.current) break;
                console.log('pause!');
                videoElement.current.pauseVideo();
                break;
            default:
                console.log(payload.data);
            }
        });

        setPlugin(dytePlugin);
    }, []);

    useEffect(() => {
        initPlugin();
    }, [initPlugin]);

    const setDocumentView = (url: string) => {
        if (url && validateYouTubeURL(url)) {
            setShare(url);
            setInputBar(url);
            const vid = validateYouTubeURL(url);
            if (vid) {
                setVideoId(vid);
            }
        }
    };

    useEffect(() => {
        if (plugin) {
            plugin.getData().then((data: { shareUrl: string }) => setDocumentView(data?.shareUrl));
        }
    }, [plugin]);

    const shareVideo = (url: string) => {
        const vid = validateYouTubeURL(url);
        dataStore.current.shareUrl = url;
        if (vid) {
            setVideoId(vid);
            plugin?.storeData(dataStore.current);
        } else {
            alert('Not a valid YouTube URL!');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputBar !== share) {
            shareVideo(inputBar);
        }
    };

    const reload = () => {
        console.log(dataStore.current);
        if (inputBar !== share) {
            shareVideo(inputBar);
        }
    };

    const onReady = (event: YouTubeEvent) => {
        console.log('Ready!');
        console.log(event);
        videoElement.current = event.target;

        console.log(videoElement.current);
    };

    const onPlay = (event: YouTubeEvent) => {
        isPlaying.current = true;
        if (!videoElement.current) videoElement.current = event.target;
        plugin?.triggerEvent({
            action: 'play',
        });
    };

    const onPause = (event: YouTubeEvent) => {
        console.log(videoElement.current);
        isPlaying.current = false;
        if (!videoElement.current) videoElement.current = event.target;

        plugin?.triggerEvent({
            action: 'pause',
        });
    };

    const onStateChange = (event: YouTubeEvent) => {
        console.log(event);
        dataStore.current.currentTime = event.target.getCurrentTime();
        dataStore.current.lastUpdated = +new Date();
        plugin?.storeData(dataStore.current);
    };

    return (
        <Container fluid className="d-flex flex-column mainViewContainer no-overflow">
            <Navbar className="top-nav">
                <Navbar.Brand href="https://youtube.com" target="_blank">
                    <img src={logo} width="30px" alt="logo" />
                </Navbar.Brand>
                <Row className="no-gutters flex-grow-1">
                    <Col>
                        <FormControl type="text" className="input-docs" placeholder="Enter YouTube URL" value={inputBar} onChange={(e) => setInputBar(e.target.value)} onKeyDown={handleKeyDown} size="sm" />
                    </Col>
                    <Col md="auto" className="pl-2 pr-1 d-flex justify-content-center align-items-center">
                        <NavItem className="nav-icon" onClick={reload}>
                            <img src={reloadIcon} width="26px" alt="refresh" />
                        </NavItem>
                    </Col>
                </Row>
            </Navbar>
            <Row className="flex-grow-1 mt-3 videoContainer">
                {
                    videoId
                    && (
                        <YouTube
                            videoId={videoId}
                            id="dyte-youtube-plugin"
                            opts={videoOptions}
                            onReady={onReady}
                            onPlay={onPlay}
                            onPause={onPause}
                            onStateChange={onStateChange}
                        />
                    )
                }
                {
                    !share
                    && (
                        <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
                            <div className="prompt mt-4">Enter a YouTube link in the URL bar above.</div>
                        </div>
                    )
                }
            </Row>
        </Container>
    );
}
