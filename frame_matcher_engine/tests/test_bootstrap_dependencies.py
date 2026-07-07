import unittest
import subprocess
import sys
import tempfile
from pathlib import Path

from frame_matcher_engine import bootstrap_dependencies


class BootstrapDependenciesTest(unittest.TestCase):
    def test_missing_modules_reports_import_failures(self):
        def fake_import(name):
            if name == "cv2":
                raise ImportError(name)
            return object()

        self.assertEqual(
            bootstrap_dependencies.missing_modules(["cv2", "multipart"], import_module=fake_import),
            ["cv2"],
        )

    def test_install_missing_dependencies_runs_pip_only_when_needed(self):
        calls = []

        def fake_import(name):
            if name == "multipart":
                raise ImportError(name)
            return object()

        def fake_runner(command, check):
            calls.append((command, check))

        result = bootstrap_dependencies.install_missing_dependencies(
            import_names=["cv2", "multipart"],
            python_executable="/usr/bin/python3",
            requirements_path=Path("/tmp/requirements.txt"),
            import_module=fake_import,
            runner=fake_runner,
        )

        self.assertEqual(result["missing"], ["multipart"])
        self.assertTrue(result["installed"])
        self.assertEqual(calls, [(["/usr/bin/python3", "-m", "pip", "install", "-r", "/tmp/requirements.txt"], True)])

    def test_install_missing_dependencies_skips_pip_when_all_imports_exist(self):
        calls = []

        result = bootstrap_dependencies.install_missing_dependencies(
            import_names=["cv2", "multipart"],
            python_executable="/usr/bin/python3",
            requirements_path=Path("/tmp/requirements.txt"),
            import_module=lambda name: object(),
            runner=lambda command, check: calls.append((command, check)),
        )

        self.assertEqual(result["missing"], [])
        self.assertFalse(result["installed"])
        self.assertEqual(calls, [])

    def test_install_missing_dependencies_reuses_existing_target_dir_before_pip(self):
        calls = []
        original_path = list(sys.path)

        with tempfile.TemporaryDirectory() as tmp_dir:
            target_path = Path(tmp_dir) / "matcher-deps"
            target_path.mkdir()

            def fake_import(name):
                if str(target_path) not in sys.path:
                    raise ImportError(name)
                return object()

            try:
                result = bootstrap_dependencies.install_missing_dependencies(
                    import_names=["cv2", "multipart"],
                    python_executable="/usr/bin/python3",
                    requirements_path=Path("/tmp/requirements.txt"),
                    target_path=target_path,
                    import_module=fake_import,
                    runner=lambda command, check: calls.append((command, check)),
                )
            finally:
                sys.path[:] = original_path

        self.assertEqual(result["missing"], [])
        self.assertFalse(result["installed"])
        self.assertEqual(result["targetPath"], str(target_path))
        self.assertEqual(calls, [])

    def test_install_missing_dependencies_falls_back_for_externally_managed_python(self):
        calls = []

        def fake_import(name):
            raise ImportError(name)

        def fake_runner(command, check):
            calls.append((command, check))
            if len(calls) == 1:
                raise subprocess.CalledProcessError(1, command)

        result = bootstrap_dependencies.install_missing_dependencies(
            import_names=["cv2", "multipart"],
            python_executable="/usr/bin/python3",
            requirements_path=Path("/tmp/requirements.txt"),
            import_module=fake_import,
            runner=fake_runner,
        )

        self.assertEqual(result["missing"], ["cv2", "multipart"])
        self.assertTrue(result["installed"])
        self.assertEqual(calls[0], (["/usr/bin/python3", "-m", "pip", "install", "-r", "/tmp/requirements.txt"], True))
        self.assertEqual(
            calls[1],
            (
                [
                    "/usr/bin/python3",
                    "-m",
                    "pip",
                    "install",
                    "--user",
                    "--break-system-packages",
                    "--no-deps",
                    "opencv-python-headless",
                    "python-multipart",
                ],
                True,
            ),
        )

    def test_install_missing_dependencies_uses_target_dir_when_user_site_is_blocked(self):
        calls = []

        def fake_import(name):
            raise ImportError(name)

        def fake_runner(command, check):
            calls.append((command, check))
            if len(calls) < 3:
                raise subprocess.CalledProcessError(1, command)

        result = bootstrap_dependencies.install_missing_dependencies(
            import_names=["multipart"],
            python_executable="/usr/bin/python3",
            requirements_path=Path("/tmp/requirements.txt"),
            target_path=Path("/tmp/matcher-deps"),
            import_module=fake_import,
            runner=fake_runner,
        )

        self.assertEqual(result["missing"], ["multipart"])
        self.assertTrue(result["installed"])
        self.assertEqual(
            calls[2],
            (
                [
                    "/usr/bin/python3",
                    "-m",
                    "pip",
                    "install",
                    "--target",
                    "/tmp/matcher-deps",
                    "--no-deps",
                    "python-multipart",
                ],
                True,
            ),
        )
        self.assertEqual(result["targetPath"], "/tmp/matcher-deps")
