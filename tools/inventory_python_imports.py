#!/usr/bin/env python3
"""List direct Python imports grouped by stdlib, in-tree, and external module."""
import argparse
import ast
import json
import os
import sys
import tokenize


SOURCE_ROOTS = ("owrx", "csdr")


def module_imports(path):
    with tokenize.open(path) as source:
        tree = ast.parse(source.read(), filename=path)
    imports = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            imports.update(alias.name for alias in node.names)
        elif isinstance(node, ast.ImportFrom) and node.level == 0 and node.module:
            imports.add(node.module)
    return imports


def build_inventory(root):
    if not hasattr(sys, "stdlib_module_names"):
        raise RuntimeError("Python 3.10 or newer is required to classify standard-library imports")

    inventory = {"stdlib": {}, "in_tree": {}, "external": {}}
    for source_root in SOURCE_ROOTS:
        directory = os.path.join(root, source_root)
        if not os.path.isdir(directory):
            continue
        for current, subdirs, filenames in os.walk(directory):
            subdirs[:] = sorted(name for name in subdirs if name != "__pycache__")
            for filename in sorted(filenames):
                if not filename.endswith(".py"):
                    continue
                path = os.path.join(current, filename)
                relative_path = os.path.relpath(path, root)
                for module in module_imports(path):
                    top_level = module.split(".", 1)[0]
                    if top_level in SOURCE_ROOTS:
                        category = "in_tree"
                    elif top_level in sys.stdlib_module_names:
                        category = "stdlib"
                    else:
                        category = "external"
                    inventory[category].setdefault(module, set()).add(relative_path)

    return {
        category: {
            module: sorted(paths)
            for module, paths in sorted(modules.items())
        }
        for category, modules in inventory.items()
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--root",
        default=os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        help="repository root (defaults to the parent directory of this script)",
    )
    parser.add_argument("--output", help="write JSON to this path instead of stdout")
    args = parser.parse_args()

    report = {
        "python": sys.version.split()[0],
        "source_roots": list(SOURCE_ROOTS),
        "scope": "direct AST imports only; dynamic imports and dependency closure are not included",
        "imports": build_inventory(os.path.abspath(args.root)),
    }
    rendered = json.dumps(report, indent=2, sort_keys=True) + "\n"
    if args.output:
        with open(args.output, "w") as destination:
            destination.write(rendered)
    else:
        sys.stdout.write(rendered)


if __name__ == "__main__":
    main()
