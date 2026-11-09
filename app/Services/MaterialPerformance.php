<?php

namespace App\Services;

use App\Models\Question;
use App\Models\StudentResult;
use Illuminate\Support\Collection;

/**
 * Menghitung performa siswa per materi dari jawaban per soal (answers_data).
 * Soal tanpa materi (data lama) dikelompokkan memakai judul kuisnya.
 */
class MaterialPerformance
{
    /** Batas tuntas yang sama dengan pewarnaan nilai di aplikasi (>= 70 hijau). */
    public const PASSING_PERCENT = 70;

    /**
     * @param  iterable<int>  $studentIds
     * @return array<int, array<int, array>> performa per materi, dikunci student_id
     */
    public function forStudents(iterable $studentIds): array
    {
        $ids = collect($studentIds)->filter()->unique()->values();
        if ($ids->isEmpty()) {
            return [];
        }

        $results = StudentResult::with('quiz:id,title,subject_id', 'quiz.subject:id,name')
            ->whereIn('student_id', $ids)
            ->get(['id', 'quiz_id', 'student_id', 'answers_data', 'correct_answers', 'wrong_answers']);

        $questionIds = $results->flatMap(fn ($r) => collect(is_array($r->answers_data) ? $r->answers_data : [])
            ->pluck('question_id'))->filter()->unique();

        $questions = Question::with('material:id,name,subject_id', 'material.subject:id,name')
            ->whereIn('id', $questionIds)
            ->get(['id', 'material_id'])
            ->keyBy('id');

        $buckets = [];
        // Satu soal bisa dikerjakan ulang (ronde ulang / kesempatan berikutnya);
        // yang dihitung hanya jawaban TERAKHIR siswa untuk soal itu.
        $latestAnswer = [];

        foreach ($results->sortBy('id') as $result) {
            $fallback = [
                'key' => 'quiz:'.mb_strtolower(trim($result->quiz?->title ?? 'Kuis dihapus')).'|'.($result->quiz?->subject_id ?? 0),
                'material_id' => null,
                'material' => $result->quiz?->title ?? 'Kuis dihapus',
                'subject' => $result->quiz?->subject?->name,
            ];

            $answers = is_array($result->answers_data) ? $result->answers_data : [];

            if (empty($answers)) {
                // Data lama tanpa rincian per soal: pakai jumlah benar/salah kuisnya
                $this->add($buckets, $result->student_id, $fallback, (int) $result->correct_answers, (int) $result->correct_answers + (int) $result->wrong_answers);
                continue;
            }

            foreach ($answers as $answer) {
                $material = $questions->get($answer['question_id'] ?? null)?->material;
                $group = $material ? [
                    'key' => 'material:'.$material->id,
                    'material_id' => $material->id,
                    'material' => $material->name,
                    'subject' => $material->subject?->name,
                ] : $fallback;

                if (isset($answer['question_id'])) {
                    $latestAnswer[$result->student_id][$answer['question_id']] = [$group, ! empty($answer['is_correct'])];
                } else {
                    $this->add($buckets, $result->student_id, $group, ! empty($answer['is_correct']) ? 1 : 0, 1);
                }
            }
        }

        foreach ($latestAnswer as $studentId => $byQuestion) {
            foreach ($byQuestion as [$group, $correct]) {
                $this->add($buckets, $studentId, $group, $correct ? 1 : 0, 1);
            }
        }

        return collect($buckets)->map(fn ($groups) => collect($groups)
            ->filter(fn ($g) => $g['total'] > 0)
            ->map(function ($g) {
                $g['percent'] = (int) round($g['correct'] / $g['total'] * 100);
                $g['needs_attention'] = $g['percent'] < self::PASSING_PERCENT;
                unset($g['key']);

                return $g;
            })
            ->sortBy([['needs_attention', 'desc'], ['percent', 'asc'], ['material', 'asc']])
            ->values()
            ->all()
        )->all();
    }

    /** Daftar materi yang perlu perhatian khusus dari hasil forStudents(). */
    public static function weak(array $performance): array
    {
        return array_values(array_filter($performance, fn ($p) => $p['needs_attention']));
    }

    private function add(array &$buckets, int $studentId, array $group, int $correct, int $total): void
    {
        $key = $group['key'];
        $buckets[$studentId][$key] ??= $group + ['correct' => 0, 'total' => 0];
        $buckets[$studentId][$key]['correct'] += $correct;
        $buckets[$studentId][$key]['total'] += $total;
    }
}
