from __future__ import annotations

import importlib
import subprocess
import sys
from pathlib import Path
from typing import Callable, Iterable


REQUIRED_IMPORTS = ("cv2", "multipart")
REQUIREMENTS_PATH = Path(__file__).resolve().parent / "requirements.txt"
TARGET_DEPENDENCIES_PATH = Path("/tmp") / "merch_matcher_deps"
PACKAGE_BY_IMPORT = {
    "cv2": "opencv-python-headless",
    "multipart": "python-multipart",
}


def missing_modules(
    import_names: Iterable[str] = REQUIRED_IMPORTS,
    import_module: Callable[[str], object] = importlib.import_module,
) -> list[str]:
    missing = []
    for name in import_names:
        try:
            import_module(name)
        except ImportError:
            missing.append(name)
    return missing


def install_missing_dependencies(
    import_names: Iterable[str] = REQUIRED_IMPORTS,
    python_executable: str = sys.executable,
    requirements_path: Path = REQUIREMENTS_PATH,
    target_path: Path = TARGET_DEPENDENCIES_PATH,
    import_module: Callable[[str], object] = importlib.import_module,
    runner: Callable[..., object] = subprocess.run,
) -> dict:
    missing = missing_modules(import_names, import_module=import_module)
    if not missing:
        return {"installed": False, "missing": []}

    if target_path.exists():
        target = str(target_path)
        if target not in sys.path:
            sys.path.insert(0, target)
        missing = missing_modules(import_names, import_module=import_module)
        if not missing:
            return {"installed": False, "missing": [], "targetPath": target}

    packages = [PACKAGE_BY_IMPORT.get(name, name) for name in missing]
    try:
        runner([python_executable, "-m", "pip", "install", "-r", str(requirements_path)], check=True)
        return {"installed": True, "missing": missing}
    except subprocess.CalledProcessError:
        pass

    try:
        runner(
            [
                python_executable,
                "-m",
                "pip",
                "install",
                "--user",
                "--break-system-packages",
                "--no-deps",
                *packages,
            ],
            check=True,
        )
        return {"installed": True, "missing": missing}
    except subprocess.CalledProcessError:
        pass

    target_path.mkdir(parents=True, exist_ok=True)
    runner(
        [
            python_executable,
            "-m",
            "pip",
            "install",
            "--target",
            str(target_path),
            "--no-deps",
            *packages,
        ],
        check=True,
    )
    target = str(target_path)
    if target not in sys.path:
        sys.path.insert(0, target)
    return {"installed": True, "missing": missing, "targetPath": target}
