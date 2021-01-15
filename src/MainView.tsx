import React, {
    useCallback, useEffect, useRef, useState,
} from 'react';
import { DytePlugin, Events } from 'dyte-plugin-sdk';
import 'boxicons';
import { Navbar, FormControl, Button } from 'react-bootstrap';

import logo from './logo.svg';

declare global {
    interface Window { gapi: any; google: any; }
}

const CLIENT_ID = '1068687898273-ce7kds60hs2knovmh515atbv31u88mj0.apps.googleusercontent.com';
const SCOPE = ['https://www.googleapis.com/auth/drive.file'];

const DEVELOPER_KEY = 'AIzaSyD-Z6EJb4qWnMEd2Q5XIQej2Xi-yKpqqfA';
const APP_ID = '1068687898273';

const FILE_MIMETYPES = 'application/vnd.google-apps.document,application/vnd.google-apps.spreadsheet,application/vnd.google-apps.presentation';

function createPicker(token: string, origin: string, cb: (data: any) => any) {
    const { google } = window;
    const view = new google.picker.View(google.picker.ViewId.DOCS);
    view.setMimeTypes(FILE_MIMETYPES);
    const picker = new google.picker.PickerBuilder()
        .setAppId(APP_ID)
        .setOrigin(origin)
        .setOAuthToken(token)
        .enableFeature(google.picker.Feature.NAV_HIDDEN)
        .addView(view)
        .setDeveloperKey(DEVELOPER_KEY)
        .setCallback((data: any) => cb(data))
        .build();
    picker.setVisible(true);
}

const oauthPopup = (cb: (data: any) => any) => {
    window.gapi.auth.authorize(
        {
            client_id: CLIENT_ID,
            scope: SCOPE,
            immediate: false,
        },
        (result: any) => {
            console.log(result);
            cb(result.access_token);
        },
    );
};

function identifyDocType(share: string): string {
    const url = new URL(share);
    if (url.pathname.startsWith('/spreadsheet')) {
        return 'sheets';
    } if (url.pathname.startsWith('/presentation')) {
        return 'slides';
    }
    return 'docs';
}

function validateDocsUrl(share: string): boolean {
    let url;
    try {
        url = new URL(share);
    } catch (_) {
        return false;
    }
    return url.host === 'docs.google.com'
        && (url.pathname.startsWith('/document')
            || url.pathname.startsWith('/presentation')
            || url.pathname.startsWith('/spreadsheet'));
}

export default function MainView() {
    const [token, setToken] = useState('');
    const [share, setShare] = useState<string>('');
    const [inputBar, setInputBar] = useState<string>('');
    const [plugin, setPlugin] = useState<DytePlugin>();
    const frame = useRef<HTMLIFrameElement>(null);

    const setDocumentView = (url: string) => {
        if (url && validateDocsUrl(url)) {
            setShare(url);
            setInputBar(url);
        }
    };

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

    useEffect(() => {
        if (plugin) {
            plugin.getData().then((data: { shareUrl: string }) => setDocumentView(data?.shareUrl));
        }
    },
    [plugin]);

    const onPickerClick = (accessToken: string) => {
        if (!accessToken) {
            return oauthPopup((token) => {
                if (token) {
                    setToken(token);
                    onPickerClick(token);
                }
            });
        }
        createPicker(accessToken, plugin?.parentOrigin || 'https://app.dyte.in', (data) => {
            if (data.action === 'picked') {
                shareDoc(data.docs[0].url);
            }
        });
    };

    let docType = 'docs';
    if (share) {
        docType = identifyDocType(share);
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputBar !== share) {
            shareDoc(inputBar);
        }
    };

    const shareDoc = (url: string) => {
        if (validateDocsUrl(url)) {
            plugin?.storeData({ shareUrl: url });
        } else {
            alert('Not a valid docs URL!');
        }
    };

    const reload = () => {
        if (inputBar !== share) {
            shareDoc(inputBar);
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
                <div className="row no-gutters flex-grow-1">
                    <div className="col">
                        <FormControl type="text" className={`input-${docType}`} placeholder="Search" value={inputBar} onChange={(e) => setInputBar(e.target.value)} onKeyDown={handleKeyDown} size="sm" />
                    </div>
                    <div className="col-auto pl-2 pr-1 d-flex justify-content-center align-items-center">
                        <div className="nav-icon" role="button" onClick={reload}>
                            <box-icon name="refresh" color="#495057" />
                        </div>
                        <div className="nav-icon ml-1" role="button" onClick={() => { onPickerClick(token); }}>
                            <box-icon name="file-find" color="#495057" />
                        </div>
                    </div>
                </div>
            </Navbar>
            <br />
            {
                share && <iframe ref={frame} src={share} className="shareIframe flex-grow-1" frameBorder={0} title="share" />
            }
            {
                !share
                && (
                    <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
                        <div className="prompt mt-4">Enter a docs/slides/spreadsheet link in the bar above, or pick a file from your google drive</div>
                        <Button className="mt-4" onClick={() => { onPickerClick(token); }} variant="primary" size="lg">Pick File</Button>
                    </div>
                )
            }
        </div>
    );
}
