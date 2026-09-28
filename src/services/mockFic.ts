import type { Fic, Paragraph, Segment } from '../types/fic';

// "*text*" -> emphasis
const p = (s: string): Paragraph => {
  const segments: Segment[] = [];
  s.split(/(\*[^*]+\*)/).forEach((part) => {
    if (!part) return;
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) segments.push({ t: part.slice(1, -1), em: true });
    else segments.push({ t: part });
  });
  return { segments };
};

export const mockFic: Fic = {
  id: 'demo',
  title: 'The Last Train',
  author: 'demo_author',
  chapters: [
    {
      title: 'Chapter 1: Platform Nine',
      paragraphs: [
        p('"You\'re late."'),
        p('He looked at the clock above the ticket hall. It said 11:52, which meant she was right, and also that he had eight minutes to fix a mistake nine years in the making.'),
        p('She was still waiting by the door, coat buttoned wrong, one glove in her hand like she\'d forgotten which of them was supposed to be cold.'),
        p('*He had rehearsed this conversation a hundred times.*'),
        p('*In the shower. On the bus. Once, embarrassingly, in front of a very patient dog.*'),
        p('"I wasn\'t sure you\'d come," she said.'),
        p('"Neither was I." The words came out steadier than he felt. "But you sent a text at two in the morning that just said *platform nine*, so."'),
        p('She smiled. It was small and crooked and it took years off both of them.'),
        p('The room suddenly felt very small.'),
        p('Somewhere overhead a speaker crackled, announced a delay to the 11:59, apologised for the inconvenience, and went quiet again. Nobody in the station reacted. Nobody in the station was listening.'),
        p('* * *'),
        p('"Do you want to sit?" he asked.'),
        p('"I want to say something first." She turned the glove over. "And I want you to let me finish, because if you interrupt I\'ll lose my nerve and go home."'),
        p('He nodded. It was the most difficult thing he had done all year, and that included the year he\'d learned to parallel park.'),
        p('"I read your letter."'),
        p('The clock ticked over to 11:53. Outside, the rain kept a steady, indifferent rhythm against the glass.'),
        p('"All of it?"'),
        p('"Twice." She looked up. "The second time I read it out loud, to see if it sounded like you."'),
        p('"And did it?"'),
        p('"Just the bad jokes."'),
        p('He laughed, and it surprised them both, a real one that cracked open something in his chest and let the cold out.'),
        p('*Say it. Say it now.*'),
        p('"I\'m sorry," he said. "I should have said that at the start. I should have said it nine years ago, honestly."'),
        p('"Yes," she agreed, gently. "You should have."'),
      ],
    },
    {
      title: 'Chapter 2: The 11:59',
      paragraphs: [
        p('The train arrived nine minutes late, which was, all things considered, generous.'),
        p('They stood at the edge of the platform while the doors hissed open and a handful of tired strangers stepped around them. Neither of them moved.'),
        p('"This is the last one," she said.'),
        p('"I know."'),
        p('"You could still get on it. Nobody would blame you." Her voice had gone careful, the way it did when she was hoping very hard about something. "You\'ve got somewhere to be."'),
        p('*I do,* he thought. *I\'m standing in it.*'),
        p('"I\'ve got nowhere to be," he said out loud, and found that it was true, and that it was the best thing he had said in years.'),
        p('The doors closed. The 11:59 pulled away into the wet dark, red lights shrinking to a single point and then to nothing at all.'),
        p('She let out a breath she had clearly been holding since the previous decade.'),
        p('"Well," she said. "Now what?"'),
        p('He offered her his arm, and after a moment that felt like a small eternity, she took it.'),
        p('"Now," he said, "we find out whether the café on the corner is still open."'),
      ],
    },
  ],
};
