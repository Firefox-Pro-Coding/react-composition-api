import * as tp from '@babel/types'
import * as bt from '@babel/traverse'

const transformImports = [
  'observable',
  'reaction',
  'autorun',
  'when',
]

const transform = (t: typeof tp, path: bt.NodePath<tp.Program>) => {
  const body = path.get('body')
  const importNodePaths = body.filter((p) => p.isImportDeclaration()) as Array<bt.NodePath<tp.ImportDeclaration>>
  const mboxImportPaths = importNodePaths.filter((p) => p.node.source.value === 'mobx')
  const mboxImportNodes = mboxImportPaths.map((p) => p.node)
  const needTransformImports: Array<{
    name: string
    localName: string
  }> = []
  mboxImportNodes.forEach((imp) => {
    imp.specifiers.forEach((s) => {
      if (!t.isImportSpecifier(s)) {
        return
      }
      if (transformImports.includes(s.imported.name)) {
        needTransformImports.push({
          name: s.imported.name,
          localName: s.local.name,
        })
      }
    })
    imp.specifiers = imp.specifiers.filter((s) => !t.isImportSpecifier(s) || !transformImports.includes(s.imported.name))
  })

  if (needTransformImports.length) {
    const specifiers = needTransformImports.map((item) => t.importSpecifier(
      t.identifier(item.localName),
      t.identifier(item.name),
    ))
    const rcaImport = t.importDeclaration(specifiers, t.stringLiteral('@firefox-pro-coding/react-composition-api'))
    const lastImport = body.filter((p) => p.isImportDeclaration()).pop()!
    lastImport.insertAfter(
      rcaImport,
    )
  }

  mboxImportPaths.forEach((p) => {
    if (!p.node.specifiers.length) {
      p.remove()
    }
  })
}

module.exports = ({ types: t }: { types: typeof tp }) => ({
  visitor: {
    Program(path: any) {
      transform(t, path)
    },
  },
})
