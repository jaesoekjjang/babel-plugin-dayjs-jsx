import { Visitor, NodePath } from "@babel/core";
import t from "@babel/types";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

import {
  Expression,
  JSXElement,
  JSXExpressionContainer,
  JSXText,
} from "babel-types";

const wrapWithDayjs = (path: NodePath<JSXExpressionContainer | JSXText>) => {
  if (path.isJSXExpressionContainer()) {
    //get Node of the expression. get("expression") will return NodePath | NodePath[]
    const expressionPath = path.get("expression") as NodePath<Expression>;

    const callExpression = t.callExpression(
      t.memberExpression(
        t.callExpression(t.identifier("dayjs"), [
          t.stringLiteral("2021-08-03"),
        ]),
        t.identifier("format")
      ),
      []
    );

    path.replaceWith(t.jsxExpressionContainer(callExpression));
  } else {
    const value = t.valueToNode((path.node as JSXText).value);

    const dayjsCallExpression = t.callExpression(t.identifier("dayjs"), [
      value,
    ]);
    const formatCallExpression = t.callExpression(t.identifier("format"), [
      dayjsCallExpression,
      t.stringLiteral("YYYY-MM-DD"),
    ]);

    path.replaceWith(formatCallExpression);
  }
  ``;
};

const isSingleJSXTextOrJSXExpressionContainer = (
  nodePath: NodePath<JSXElement | JSXExpressionContainer | JSXText>[]
): nodePath is NodePath<JSXText | JSXExpressionContainer>[] => {
  return (
    nodePath.length === 1 &&
    (nodePath[0].isJSXText() || nodePath[0].isJSXExpressionContainer())
  );
};
// find closing tag(day) and replace it with dayjs
const plugin = () => {
  const visitor: Visitor<{
    opts: { tagName: string };
  }> = {
    Program: {
      exit(path, state) {},
    },
    JSXClosingElement(path, { opts: { tagName = "day" } }) {
      const jsxIdentifier = path.get("name");
      if (!jsxIdentifier.isJSXIdentifier({ name: tagName })) return;

      // get children of the parent
      const parent = path.parentPath as NodePath<JSXElement>;
      const children = parent.get("children") as NodePath<
        JSXElement | JSXExpressionContainer | JSXText
      >[];

      if (!isSingleJSXTextOrJSXExpressionContainer(children)) {
        throw new Error(
          "children must be single jsxText or jsxExpressionContainer"
        );
      }

      wrapWithDayjs(children[0]);
    },
  };

  return {
    inherits: require("@babel/plugin-syntax-jsx").default,
    visitor,
  };
};

export default plugin;
