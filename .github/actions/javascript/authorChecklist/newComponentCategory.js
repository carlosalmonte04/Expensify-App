const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const _ = require('underscore');
const fs = require('fs');
const path = require('path');
const CONST = require('../../../libs/CONST');

const items = [
    "I verified that similar component doesn't exist in the codebase",
    "I verified that all props are defined accurately and each prop has a `/** comment above it */`",
    "I verified that each file is named correctly",
    "I verified that each component has a clear name that is non-ambiguous and the purpose of the component can be inferred from the name alone",
    "I verified that the only data being stored in component state is data necessary for rendering and nothing else",
    "In component if we are not using the full Onyx data that we loaded, I've added the proper selector in order to ensure the component only re-renders when the data it is using changes",
    "For Class Components, any internal methods passed to components event handlers are bound to `this` properly so there are no scoping issues (i.e. for `onClick={this.submit}` the method `this.submit` should be bound to `this` in the constructor)",
    "I verified that component internal methods bound to `this` are necessary to be bound (i.e. avoid `this.submit = this.submit.bind(this);` if `this.submit` is never passed to a component event handler like `onClick`)",
    "I verified that all JSX used for rendering exists in the render method",
    "I verified that each component has the minimum amount of code necessary for its purpose, and it is broken down into smaller components in order to separate concerns and functions",
];

function detectReactComponent(code) {
    if (!code) {
        return;
    }
    const ast = parse(code, {
        sourceType: 'module',
        plugins: ['jsx'] // enable jsx plugin
    });

    let isReactComponent = false;

    traverse(ast, {
        FunctionDeclaration(path) {
            if (isReactComponent) {
                return;
            }
            if (
                path.node.id &&
                _.some(path.node.body.body,
                    (node) => node.type === 'ReturnStatement' && node.argument.type === 'JSXElement'
                )
            ) {
                isReactComponent = true;
            }
        },
    });

    return isReactComponent;
};

function readFile(filename) {
    const filePath = path.resolve(__dirname, `../../../../${filename}`);
    const filePath2 = path.resolve(filename);

    try {
        console.log('reading', filePath2, fs.existsSync(path.join(process.env.GITHUB_WORKSPACE, 'package.json')));
        return fs.readFileSync(filePath2, 'utf-8');
    } catch (error) {
        console.error(`Error reading ${filePath2}`, error);
    }
}

function detectFunction(changedFiles) {
    console.log('detectFunction', process.cwd(), __dirname, process.env.GITHUB_WORKSPACE, path.join(process.env.GITHUB_WORKSPACE, 'package.json'));

    fs.readdirSync(__dirname).forEach(file => {
        console.log(file);
      });


    const filteredFiles = _.filter((changedFiles), ({ filename }) => filename.endsWith('.js') || filename.endsWith('.jsx') || filename.endsWith('.ts') || filename.endsWith('.tsx'));
    return _.some(filteredFiles, ({ filename }) => detectReactComponent(readFile(filename)));
}

module.exports = {
    detectFunction,
    items,
};
