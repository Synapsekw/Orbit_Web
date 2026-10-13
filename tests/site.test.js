import test from 'node:test';
import assert from 'node:assert/strict';
import { contextFromSearch, validateEnquiry, prepareEnquiry } from '../src/site/enquiry.js';

const good={name:'A Person',email:'person@example.com',company:'Example',phone:'',industry:'construction',service:'spatial-mapping',location:'Kuwait City',timing:'Next month',message:'Please discuss mapping the site.'};
test('enquiry context accepts known choices and rejects unknown query content',()=>{
  assert.deepEqual(contextFromSearch('?industry=construction&service=spatial-mapping'),{industry:'construction',service:'spatial-mapping'});
  assert.deepEqual(contextFromSearch('?industry=%3Cscript%3E&service=nope'),{industry:'',service:'help'});
});
test('required enquiry fields reject whitespace and invalid email without requiring a phone',()=>{
  assert.deepEqual(validateEnquiry(good),{});
  const errors=validateEnquiry({...good,name:'  ',company:'\n',email:'not-an-email',location:'',message:'short'});
  for(const field of ['name','company','email','location','message'])assert.ok(errors[field]);
});
test('prepared email retains scope and special characters, never reports sent',()=>{
  const result=prepareEnquiry({...good,message:'A&B <asset> + capture?\nSecond line.'});
  assert.match(result.brief,/Industry: Construction/);
  assert.match(result.brief,/Service: Spatial mapping/);
  assert.ok(result.mailto.startsWith('mailto:info@orbitaerials.com?'));
  const body=new URL(result.mailto).searchParams.get('body');
  assert.equal(body,result.brief);
  assert.match(body,/A&B <asset> \+ capture\?/);
});
test('long project descriptions remain in the copyable brief and arbitrary option values are rejected',()=>{
  assert.equal(validateEnquiry({...good,service:'x'}).service,'Choose a service from the list.');
  assert.equal(validateEnquiry({...good,message:'x'.repeat(2501)}).message,'Keep the project description within 2,500 characters.');
  assert.ok(prepareEnquiry({...good,message:'x'.repeat(2500)}).brief.includes('x'.repeat(2500)));
});
