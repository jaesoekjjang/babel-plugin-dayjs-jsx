import { Visitor, NodePath } from "@babel/core";
import t, { JSXElement, JSXExpressionContainer, JSXText } from "@babel/types";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const isJSXText = (
  nodePath: NodePath<JSXExpressionContainer> | NodePath<JSXText>
): nodePath is NodePath<JSXText> => {
  return nodePath.isJSXText();
};

const getDayjsExpression = (
  path: NodePath<JSXExpressionContainer> | NodePath<JSXText>,
  format: string
) => {
  const callExpression = t.callExpression(
    t.memberExpression(
      t.callExpression(t.identifier("dayjs"), [
        isJSXText(path)
          ? t.stringLiteral(path.node.value)
          : (path.node.expression as t.Expression),
      ]),
      t.identifier("format")
    ),
    [format ? t.stringLiteral(format) : t.nullLiteral()]
  );

  return callExpression;
};

const isSingleJSXTextOrJSXExpressionContainer = (
  nodePath: NodePath<JSXElement | JSXExpressionContainer | JSXText>[]
): nodePath is (NodePath<JSXText> | NodePath<JSXExpressionContainer>)[] => {
  return (
    nodePath.length === 1 &&
    (nodePath[0].isJSXText() || nodePath[0].isJSXExpressionContainer())
  );
};

const plugin = () => {
  const visitor: Visitor<{
    opts: { tag: string; format: string };
  }> = {
    JSXOpeningElement(path, { opts: { tag = "day", format } }) {
      const jsxIdentifier = path.get("name");
      if (!jsxIdentifier.isJSXIdentifier({ name: tag })) return;

      const parent = path.parentPath as NodePath<JSXElement>;
      const children = parent.get("children") as NodePath<
        JSXElement | JSXExpressionContainer | JSXText
      >[];

      if (!isSingleJSXTextOrJSXExpressionContainer(children)) {
        throw new Error(
          "children must be single jsxText or jsxExpressionContainer"
        );
      }

      // props에서 format을 가져오기
      // const formatAttr = path.node.attributes.find(
      //   (attr) => attr.type === "JSXAttribute" && attr.name.name === "format"
      // );

      // if (t.isJSXAttribute(formatAttr)) {
      // }

      const dayjsExpression = getDayjsExpression(children[0], format);

      // 경우의 수. 부모: <day/> 태그
      // 1. 부모의 부모가 JSXExpressionContainer인 경우 => 부모를 dayjsExpression으로 대체
      // 2. 부모의 부모가 JSXElement인 경우 => 부모를 t.JSXExpressionContainer(dayjsExpression)으로 대체
      const grandParent = parent.parentPath;
      if (grandParent.isJSXElement()) {
        return parent.replaceWith(t.jsxExpressionContainer(dayjsExpression));
      }

      parent.replaceWith(dayjsExpression);
    },
  };

  return {
    inherits: require("@babel/plugin-syntax-jsx").default,
    visitor,
  };
};

export default plugin;
