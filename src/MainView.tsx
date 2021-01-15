import React, {
    useCallback, useEffect, useRef, useState,
} from 'react';
import { DytePlugin, Events } from 'dyte-plugin-sdk';
import {
    Navbar,
    FormControl,
    Row,
    Col,
    NavItem,
} from 'react-bootstrap';

import YouTube from 'react-youtube';

import logo from './logo.svg';

declare global {
    interface Window { }
}

const YOUTUBE_URL_REGEX = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;

const videoOptions = {
    height: '600',
    width: '100%',
};

function validateYouTubeURL(share: string): string | null {
    const match = share.match(YOUTUBE_URL_REGEX);
    return (match && match[7].length === 11) ? match[7] : null;
}

export default function MainView() {
    const [videoId, setVideoId] = useState('');
    const [share, setShare] = useState<string>('');
    const [inputBar, setInputBar] = useState<string>('');
    const [plugin, setPlugin] = useState<DytePlugin>();
    const frame = useRef<HTMLIFrameElement>(null);

    const initPlugin = useCallback(async () => {
        const dytePlugin = new DytePlugin();
        await dytePlugin.init();
        dytePlugin.connection.on(Events.pluginData, (payload) => {
            setDocumentView(payload.data.shareUrl);
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
        }
    };

    useEffect(() => {
        if (plugin) {
            plugin.getData().then((data: { shareUrl: string }) => setDocumentView(data?.shareUrl));
        }
    }, [plugin]);

    const shareVideo = (url: string) => {
        const vid = validateYouTubeURL(url);
        if (vid) {
            console.log(vid);
            setVideoId(vid);
            plugin?.storeData({ shareUrl: url });
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
        if (inputBar !== share) {
            shareVideo(inputBar);
        } else if (frame.current) {
            const { current } = frame;
            frame.current.src = current.src;
        }
    };

    return (
        <div className="d-flex flex-column mainViewContainer">
            <Navbar className="top-nav">
                <Navbar.Brand>
                    <img src={logo} width={30} alt="logo" />
                </Navbar.Brand>
                <Row className="no-gutters flex-grow-1">
                    <Col>
                        <FormControl type="text" className="input-docs" placeholder="Enter YouTube URL" value={inputBar} onChange={(e) => setInputBar(e.target.value)} onKeyDown={handleKeyDown} size="sm" />
                    </Col>
                    <Col md="auto" className="pl-2 pr-1 d-flex justify-content-center align-items-center">
                        <NavItem className="nav-icon" onClick={reload}>
                            {/* <box-icon name="refresh" color="#495057" /> */}
                        </NavItem>
                    </Col>
                </Row>
            </Navbar>
            <br />
            {
                share
                && (
                    <YouTube
                        videoId={videoId}
                        id="dyte-youtube-plugin"
                        opts={videoOptions}
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
        </div>
    );
}
