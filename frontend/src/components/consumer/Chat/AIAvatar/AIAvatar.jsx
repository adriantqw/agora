import Mascot from '../../../common/Mascot/Mascot';

export default function AIAvatar({ size = 40, isSearching = false }) {
  return (
    <Mascot variant="avatar" size={size} isSearching={isSearching} />
  );
}
