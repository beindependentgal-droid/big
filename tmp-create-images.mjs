import { writeFileSync } from 'fs';
import { join } from 'path';
const files = [
  'african_mother_and_child_wellness_1784704199174.jpg',
  'african_woman_entrepreneur_portrait_1784664054544.jpg',
  'african_woman_leading_masterclass_1784704151649.jpg',
  'african_woman_learning_laptop_1784664067278.jpg',
  'african_woman_portrait_1_1784708232425.jpg',
  'african_woman_portrait_2_1784708246407.jpg',
  'african_woman_portrait_3_1784708258772.jpg',
  'african_woman_portrait_4_1784708270262.jpg',
  'african_women_community_circle_1784704135356.jpg',
  'african_women_mentorship_discussion_1784664078314.jpg',
  'african_women_tech_collaboration_1784664040784.jpg'
];
const base64 = '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAFP/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPwA//8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAgEBPwA//8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAwEBPwA//9k=';
const bytes = Buffer.from(base64, 'base64');
for (const file of files) {
  writeFileSync(join(process.cwd(), 'public', 'images', file), bytes);
}
console.log('Created', files.length, 'image placeholders.');
