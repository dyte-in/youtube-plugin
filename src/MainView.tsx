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

import YouTube, { Options } from 'react-youtube';

import logo from './assets/youtube_icon.png';
import reloadIcon from './assets/reload.png';

declare global {
    interface Window { }
}

const YOUTUBE_URL_REGEX = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;

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
    isPlaying: boolean;
}

export default function MainView() {
    const [videoId, setVideoId] = useState<string>('');
    const [share, setShare] = useState<string>('');
    const [inputBar, setInputBar] = useState<string>('');
    const [plugin, setPlugin] = useState<DytePlugin>();
    const [videoOptions] = useState<Options>({
        height: '100%',
        width: '100%',
        playerVars: {
            autoplay: 0,
        },
    });

    const dataStore = useRef<YouTubeStoredData>({
        shareUrl: '',
        currentTime: 0,
        lastUpdated: +new Date(),
        isPlaying: false,
    });
    const isPlaying = useRef<boolean>(false);
    const videoElement = useRef<any>(null);

    const timeDelta = () => dataStore.current.currentTime + (
        +new Date() - dataStore.current.lastUpdated
    ) / 1000;

    const initPlugin = useCallback(async () => {
        const dytePlugin = new DytePlugin();
        await dytePlugin.init();

        dytePlugin.connection.on(Events.pluginData, (payload: { data: YouTubeStoredData }) => {
            setDocumentView(payload.data.shareUrl);
            dataStore.current = payload.data;
        });

        dytePlugin.connection.on(Events.pluginEvent, (payload: YouTubeEventData) => {
            if (!videoElement.current) {
                return;
            }

            switch (payload.data.action) {
            case 'play':
                if (isPlaying.current) break;
                isPlaying.current = true;
                videoElement.current.seekTo(timeDelta());
                videoElement.current.playVideo();
                break;
            case 'pause':
                if (!isPlaying.current) break;
                isPlaying.current = false;
                videoElement.current.seekTo(timeDelta());
                videoElement.current.pauseVideo();
                break;
            default:
                break;
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
            plugin.getData().then((data: YouTubeStoredData) => {
                if (data) {
                    setDocumentView(data.shareUrl);
                    dataStore.current = data;
                }
            });
        }
    }, [plugin]);

    const shareVideo = (url: string) => {
        const vid = validateYouTubeURL(url);
        if (vid) {
            setVideoId(vid);
            const data: YouTubeStoredData = {
                shareUrl: url,
                currentTime: 0,
                lastUpdated: +new Date(),
                isPlaying: false,
            };
            plugin?.storeData(data);
        } else {
            // eslint-disable-next-line no-alert
            alert('Not a valid YouTube URL!');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputBar !== share) {
            shareVideo(inputBar);
        }
    };

    const reload = () => {
        if (inputBar !== share) {
            shareVideo(inputBar);
        }
    };

    const changeStoredState = (event: YouTubeEvent) => {
        dataStore.current.isPlaying = isPlaying.current;
        dataStore.current.currentTime = event.target.getCurrentTime();
        dataStore.current.lastUpdated = +new Date();
        plugin?.storeData(dataStore.current);
    };

    const onReady = (event: YouTubeEvent) => {
        videoElement.current = event.target;
        videoElement.current.seekTo(timeDelta());

        if (videoElement.current) {
            if (dataStore.current.isPlaying) {
                videoElement.current.playVideo();
            } else {
                videoElement.current.pauseVideo();
            }
        }
    };

    const onPlay = (event: YouTubeEvent) => {
        if (isPlaying.current) return;
        isPlaying.current = true;

        changeStoredState(event);

        plugin?.triggerEvent({
            action: 'play',
        });
    };

    const onPause = (event: YouTubeEvent) => {
        if (!isPlaying.current) return;
        isPlaying.current = false;

        changeStoredState(event);

        plugin?.triggerEvent({
            action: 'pause',
        });
    };

    const onStateChange = (event: YouTubeEvent) => {
        if (!videoElement.current) videoElement.current = event.target;
    };

    return (
        <Container
            fluid
            className="d-flex flex-column mainViewContainer no-overflow"
        >
            <Navbar className="top-nav">
                <Navbar.Brand
                    href="https://youtube.com"
                    target="_blank"
                >
                    <img src={logo} width="30px" alt="logo" />
                </Navbar.Brand>
                <Row className="no-gutters flex-grow-1">
                    <Col>
                        <FormControl
                            type="text"
                            className="input-docs"
                            placeholder="Enter YouTube URL"
                            value={inputBar}
                            onChange={(e) => setInputBar(e.target.value)}
                            onKeyDown={handleKeyDown}
                            size="sm"
                        />
                    </Col>
                    <Col
                        md="auto"
                        className="pl-2 pr-1 d-flex justify-content-center align-items-center"
                    >
                        <NavItem
                            className="nav-icon"
                            onClick={reload}
                        >
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
                    !videoId
                    && (
                        <div
                            className="flex-grow-1 d-flex flex-column justify-content-center align-items-center"
                        >
                            <div
                                className="prompt mt-4"
                            >
                                Enter a YouTube link in the URL bar above.
                            </div>
                        </div>
                    )
                }
            </Row>
        </Container>
    );
}
