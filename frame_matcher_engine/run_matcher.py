from __future__ import annotations

import argparse

from bootstrap_dependencies import install_missing_dependencies


def main() -> None:
    parser = argparse.ArgumentParser(description="Install missing dependencies and run the frame matcher API.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", default=8010, type=int)
    args = parser.parse_args()

    install_missing_dependencies()

    import uvicorn

    uvicorn.run("app:app", host=args.host, port=args.port)


if __name__ == "__main__":
    main()
