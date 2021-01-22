<p align="center">
  <a href="https://dyte.in">
    <img src="https://dyte-uploads.s3.ap-south-1.amazonaws.com/dyte-logo-dark.svg" alt="Logo" width="80">
  </a>

  <h3 align="center">YouTube Plugin by dyte</h3>

  <p align="center">
    Watch YouTube videos with shared controls on dyte.
    <br />
    <a href="https://github.com/dyte-in/youtube-plugin"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://app.dyte.in">View Demo</a>
    ·
    <a href="https://github.com/dyte-in/youtube-plugin/issues">Report Bug</a>
    ·
    <a href="https://github.com/dyte-in/youtube-plugin/issues">Request Feature</a>
  </p>
</p>

## About The Project

This is a client side [dyte](https://app.dyte.in) plugin which lets you watch YouTube videos with participants in the meeting, in real-time. It uses the plugin SDK to sync events between the participants of the meeting to ensure that the video is paused and/or played for all participants at the same time.

### Built With

- [dyte-plugin-sdk](https://www.npmjs.com/package/dyte-plugin-sdk)
- [React](https://reactjs.org/)
- [Typescript](https://www.typescriptlang.org/)
- [react-youtube](https://www.npmjs.com/package/react-youtube)

## Getting Started

### Prerequisites

- npm
- node

### Installation

1. Clone the repository on your server
```bash
git clone git@github.com:dyte-in/youtube-plugin.git
```

2. Build the youtube plugin and serve the build output from your server.
```bash
cd youtube-plugin
npm run build
```

3. Get SSL certificates for your plugin. (Optional but strongly recommended, might cause issues if ignored)

4. Point a domain to your plugin.

5. Get your plugin domain registered on `dyte`.

6. Visit `dyte` and use your plugin!

## Roadmap

See the open issues for a list of proposed features (and known issues).

<!-- USAGE EXAMPLES -->
## Usage

Head over to [app.dyte.in](https://app.dyte.in), open the plugins sidebar and select the `YouTube Plugin`.

<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the Branch (`git push -u origin feature/AmazingFeature`)
5. Open a Pull Request

You are requested to follow the contribution guidelines specified in [CONTRIBUTING.md](./CONTRIBUTING.md) while contributing to the project :smile:.


## License

Distributed under the MIT License. See [LICENSE](./LICENSE) for more information.
