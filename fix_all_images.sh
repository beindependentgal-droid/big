for file in src/components/*.tsx; do
  sed -i "s|/images/hero-women2.jpg|https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200\&h=1200\&fit=crop|g" "$file"
  sed -i "s|/images/bswomen.jpg|https://images.unsplash.com/photo-1573164574472-797ce3e32b35?w=800\&h=800\&fit=crop|g" "$file"
  sed -i "s|/images/female1.jpg|https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=200\&h=200\&fit=crop|g" "$file"
  sed -i "s|/images/member-[1-3].png|https://images.unsplash.com/photo-1531123414780-f74242c2b052?w=200\&h=200\&fit=crop|g" "$file"
  sed -i "s|/images/together.jpg|https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800\&h=800\&fit=crop|g" "$file"
  sed -i "s|/images/bs.jpg|https://images.unsplash.com/photo-1573164574572-cb89e39749b4?w=800\&h=800\&fit=crop|g" "$file"
  sed -i "s|/images/wm.jpg|https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200\&h=200\&fit=crop|g" "$file"
  sed -i "s|/images/wj.jpg|https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200\&h=200\&fit=crop|g" "$file"
done
