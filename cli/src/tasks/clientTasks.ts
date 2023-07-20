import { Config } from '../config';
import { ensurePath, writeFileToPath } from '../helpers/files';
import { renderClientCjs, renderClientEsm } from '../render/client/renderClient';
import { renderClientDefinition } from '../render/client/renderClientDefinition';
import { RenderContext } from '../render/common/RenderContext';
import { renderRequestTypes } from '../render/requestTypes/renderRequestTypes';
import { renderResponseTypes } from '../render/responseTypes/renderResponseTypes';
import { renderSchema } from '../render/schema/renderSchema';
import { renderTypeGuards } from '../render/typeGuards/renderTypeGuards';
import { renderTypeMap } from '../render/typeMap/renderTypeMap';
import browserify from 'browserify';
import { createWriteStream, readFileSync, writeFileSync } from 'fs';
import Listr, { ListrTask } from 'listr';
import { resolve } from 'path';
import { minify } from 'terser';

const schemaGqlFile = 'schema.graphql';
const schemaTypesFile = 'schema.ts';
const guardsFileCjs = 'guards.cjs.js';
const guardsFileEsm = 'guards.esm.js';
const typeMapFileCjs = 'types.cjs.js';
const typeMapFileEsm = 'types.esm.js';
const clientFileCjs = 'index.js';
const clientTypesFile = 'index.d.ts';

export function clientTasks(config: Config): ListrTask[] {
  const clientFileEsm = config.onlyEsModules ? 'index.js' : 'index.esm.js';

  if (!config.output) throw new Error('`output` must be defined in the config');

  const output = config.output;

  const tasks: (false | ListrTask)[] = [
    {
      title: `writing ${schemaGqlFile}`,
      task: async (ctx) => {
        const renderCtx = new RenderContext(ctx.schema, config);
        renderSchema(ctx.schema, renderCtx);
        await writeFileToPath([output, schemaGqlFile], await renderCtx.toCode('graphql'));
      },
    },
    {
      title: `writing ${schemaTypesFile}`,
      task: async (ctx) => {
        const renderCtx = new RenderContext(ctx.schema, config);

        renderResponseTypes(ctx.schema, renderCtx);
        renderRequestTypes(ctx.schema, renderCtx);
        renderTypeGuards(ctx.schema, renderCtx);

        await writeFileToPath([output, schemaTypesFile], await renderCtx.toCode('typescript'));
      },
    },
    !config.onlyCJSModules && {
      title: `writing ${guardsFileEsm}`,
      task: async (ctx) => {
        const renderCtx = new RenderContext(ctx.schema, config);

        renderTypeGuards(ctx.schema, renderCtx, 'esm');

        await writeFileToPath([output, guardsFileEsm], await renderCtx.toCode('typescript'));
      },
    },
    !config.onlyEsModules && {
      title: `writing ${guardsFileCjs}`,
      task: async (ctx) => {
        const renderCtx = new RenderContext(ctx.schema, config);

        renderTypeGuards(ctx.schema, renderCtx, 'cjs');

        await writeFileToPath([output, guardsFileCjs], await renderCtx.toCode('typescript'));
      },
    },
    {
      title: `writing types`,
      task: async (ctx) => {
        const renderCtx = new RenderContext(ctx.schema, config);

        renderTypeMap(ctx.schema, renderCtx);

        if (!config.onlyEsModules) {
          await writeFileToPath([output, typeMapFileCjs], `module.exports = ${await renderCtx.toCode()}`);
        }
        if (!config.onlyCJSModules) {
          await writeFileToPath([output, typeMapFileEsm], `export default ${await renderCtx.toCode()}`);
        }
      },
    },
    !config.onlyEsModules && {
      title: `writing ${clientFileCjs}`,
      task: async (ctx) => {
        const renderCtx = new RenderContext(ctx.schema, config);

        renderClientCjs(ctx.schema, renderCtx);
        await writeFileToPath([output, clientFileCjs], await renderCtx.toCode('typescript'));
      },
    },
    !config.onlyCJSModules && {
      title: `writing ${clientFileEsm}`,
      task: async (ctx) => {
        const renderCtx = new RenderContext(ctx.schema, config);
        renderClientEsm(ctx.schema, renderCtx);
        await writeFileToPath([output, clientFileEsm], await renderCtx.toCode('typescript'));
      },
    },
    {
      title: `writing ${clientTypesFile}`,
      task: async (ctx) => {
        const renderCtx = new RenderContext(ctx.schema, config);

        renderClientDefinition(ctx.schema, renderCtx);

        await writeFileToPath([output, clientTypesFile], await renderCtx.toCode('typescript'));
      },
    },
    !!config?.['standalone-name'] && {
      title: `writing UMD`,
      task: async (ctx) => {
        const b = browserify({
          standalone: config['standalone-name'],
        });
        const inFile = resolve(output, clientFileCjs);
        const outFile = resolve(output, 'standalone.js');
        b.plugin(require('esmify'));
        b.add(inFile);
        b.bundle()
          .pipe(createWriteStream(outFile))
          .on('finish', async () => {
            if (!config['standalone-compress']) {
              return;
            }
            const result = await minify(readFileSync(outFile).toString(), {
              compress: config['standalone-compress'],
            });
            await writeFileSync(outFile, result?.code ?? '');
          });
      },
    },
  ];

  return [
    {
      title: 'preparing client directory',
      task: () => ensurePath([output], true),
    },
    {
      title: `writing files`,
      task: () => new Listr(tasks.filter((x) => Boolean(x)) as ReadonlyArray<ListrTask>, { concurrent: true }),
    },
  ];
}
