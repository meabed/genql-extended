import { arg, mutationField, objectType } from 'nexus';

const input = {
  name: arg({ type: 'String', required: true }),
};

const output = objectType({
  name: 'v1GetUserOutput',
  definition(t) {
    t.field('name', { type: 'String' });
  },
});

export const field = mutationField('v1GetUser', {
  type: output,
  required: true,
  args: input,
  async resolve(_root, args, ctx, _info) {
    const { name } = args;

    return {};
  },
});

export const v1GetUser = {
  field,
  input,
  output,
};
